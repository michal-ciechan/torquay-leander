<?php
// Enquiry forms: the static site posts to /wp-json/tl/v1/enquiry, and this
// emails the club and keeps a copy under WP admin > Enquiries.

if (!defined('ABSPATH')) {
    exit;
}

const TL_ENQUIRY_TO_OPTION  = 'tl_enquiry_to';
const TL_ENQUIRY_TO_DEFAULT = 'torquayleander@hotmail.com';
// Where forms on the /preview/ build and local dev go (set in Settings > TL Preview).
const TL_ENQUIRY_PREVIEW_TO_OPTION = 'tl_enquiry_preview_to';
const TL_ENQUIRY_TYPE       = 'tl_enquiry';
const TL_ENQUIRY_PER_HOUR   = 5; // per visitor IP

// Form type => field name => [label, required]. Anything else posted is ignored.
const TL_ENQUIRY_FORMS = array(
    'membership' => array(
        'title'  => 'Membership enquiry',
        'fields' => array(
            'swimmer_name'  => array('Name of swimmer', true),
            'date_of_birth' => array('Date of birth', true),
            'swim_level'    => array('Swim level', true),
            'guardian_name' => array('Parent / guardian', true),
            'phone'         => array('Contact number', true),
            'email'         => array('Email', true),
        ),
    ),
    'general' => array(
        'title'  => 'General enquiry',
        'fields' => array(
            'name'    => array('Name', true),
            'email'   => array('Email', true),
            'phone'   => array('Contact number', false),
            'subject' => array('Subject', false),
            'message' => array('Message', true),
        ),
    ),
);

function tl_enquiry_to() {
    $to = get_option(TL_ENQUIRY_TO_OPTION);
    return is_email($to) ? $to : TL_ENQUIRY_TO_DEFAULT;
}

// Falls back to the club address (subject still marked [Preview]) when unset.
function tl_enquiry_preview_to() {
    $to = get_option(TL_ENQUIRY_PREVIEW_TO_OPTION);
    return is_email($to) ? $to : tl_enquiry_to();
}

add_action('init', function () {
    register_post_type(TL_ENQUIRY_TYPE, array(
        'labels'       => array('name' => 'Enquiries', 'singular_name' => 'Enquiry'),
        'public'       => false,
        'show_ui'      => true,
        'menu_icon'    => 'dashicons-email',
        'supports'     => array('title', 'editor'),
        'capabilities' => array('create_posts' => 'do_not_allow'), // only the form creates them
        'map_meta_cap' => true,
    ));
});

add_action('rest_api_init', function () {
    register_rest_route('tl/v1', '/enquiry', array(
        'methods'             => 'POST',
        'callback'            => 'tl_enquiry_receive',
        'permission_callback' => '__return_true',
    ));
});

function tl_enquiry_receive(WP_REST_Request $req) {
    $p    = $req->get_params();
    $type = isset($p['type']) ? (string) $p['type'] : '';
    if (!isset(TL_ENQUIRY_FORMS[$type])) {
        return new WP_Error('tl_enquiry_type', 'Unknown form.', array('status' => 400));
    }

    // Bots fill in the hidden "website" field; tell them it worked and drop it.
    if (!empty($p['website'])) {
        return array('ok' => true);
    }

    $ip    = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    $limit = 'tl_enquiry_ip_' . md5($ip);
    $count = (int) get_transient($limit);
    if ($count >= TL_ENQUIRY_PER_HOUR) {
        return new WP_Error('tl_enquiry_limit', 'Too many messages - please try again later.', array('status' => 429));
    }

    $form   = TL_ENQUIRY_FORMS[$type];
    $values = array();
    foreach ($form['fields'] as $name => list($label, $required)) {
        $raw = isset($p[$name]) ? (string) $p[$name] : '';
        $val = $name === 'message' ? sanitize_textarea_field($raw) : sanitize_text_field($raw);
        $val = mb_substr($val, 0, $name === 'message' ? 5000 : 200);
        if ($required && $val === '') {
            return new WP_Error('tl_enquiry_missing', "Please fill in: $label.", array('status' => 400));
        }
        $values[$label] = $val;
    }
    $email = $values['Email'];
    if (!is_email($email)) {
        return new WP_Error('tl_enquiry_email', 'Please check the email address.', array('status' => 400));
    }
    set_transient($limit, $count + 1, HOUR_IN_SECONDS);

    $who     = $type === 'membership' ? $values['Name of swimmer'] : $values['Name'];
    $subject = $form['title'] . ': ' . $who;
    if ($type === 'general' && $values['Subject'] !== '') {
        $subject .= ' - ' . $values['Subject'];
    }
    $preview = isset($p['channel']) && $p['channel'] === 'preview';
    if ($preview) {
        $subject = '[Preview] ' . $subject;
    }

    $lines = array();
    foreach ($values as $label => $val) {
        if ($val !== '') {
            $lines[] = $label === 'Message' ? "\n$label:\n$val" : "$label: $val";
        }
    }
    $page = isset($p['page']) ? esc_url_raw((string) $p['page']) : '';
    $body = 'New ' . strtolower($form['title']) . " from the website.\n\n" . implode("\n", $lines)
        . "\n\n--\nSent from " . ($page !== '' ? $page : home_url('/')) . "\nReply to this email to answer $who directly.\n";

    $sent = wp_mail($preview ? tl_enquiry_preview_to() : tl_enquiry_to(), $subject, $body, array(
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: ' . $email,
    ));

    wp_insert_post(array(
        'post_type'    => TL_ENQUIRY_TYPE,
        'post_status'  => 'private',
        'post_title'   => ($sent ? '' : '[email failed] ') . $subject,
        'post_content' => $body,
    ));

    return array('ok' => true);
}
