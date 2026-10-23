<?php
/**
 * Plugin Name: TL Preview
 * Description: Serves the new Torquay Leander site (built on GitHub Pages) on this domain: /preview/ is the work-in-progress build, /rc/ the signed-off release candidate, and with "Serve the new site" on (Settings > TL Preview) the release candidate also answers at the root. WordPress keeps wp-admin, logins, the REST API and any URL the new site does not have. Also receives the enquiry forms and emails them to the club. Deactivate to remove.
 * Version: 1.3.0
 * Author: Mike Ciechan
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

const TL_PREVIEW_ORIGIN = 'https://michal-ciechan.github.io';
const TL_PREVIEW_TTL    = 300; // seconds a fetched file is cached

// Local prefix => upstream base path on TL_PREVIEW_ORIGIN, checked in order.
// /preview is the `preview` branch build, /rc the `master` build.
const TL_PREVIEW_MAPPINGS = array(
    '/preview' => '/torquay-leander/preview',
    '/rc'      => '/torquay-leander',
);

// When live, the root serves this build (the `master` one, same as /rc).
const TL_PREVIEW_ROOT_BASE = '/torquay-leander';
const TL_PREVIEW_OPTION    = 'tl_preview_live';

// Requests WordPress must keep answering even when live: wp-admin, wp-login.php,
// wp-json, wp-content, wp-cron.php, xmlrpc.php, and ?p= / ?rest_route= style URLs.
const TL_PREVIEW_WP_PATHS = '#^/(wp-|xmlrpc\.php|index\.php)#';
const TL_PREVIEW_WP_QUERY = array('p', 'page_id', 'preview', 'rest_route', 's', 'feed', 'attachment_id', 'author', 'cat');

require_once __DIR__ . '/enquiries.php';

// Runs before WordPress parses the request, so WP never sees these URLs.
add_action('plugins_loaded', 'tl_preview_maybe_serve', 0);

// Live, the new site's sitemap.xml (linked from its robots.txt) replaces
// WordPress's wp-sitemap.xml, which only lists the old pages.
add_filter('wp_sitemaps_enabled', function ($enabled) {
    return get_option(TL_PREVIEW_OPTION) ? false : $enabled;
});

function tl_preview_maybe_serve() {
    $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
    $path = (string) parse_url($uri, PHP_URL_PATH);

    foreach (TL_PREVIEW_MAPPINGS as $prefix => $base) {
        if ($path === $prefix || strpos($path, $prefix . '/') === 0) {
            tl_preview_serve($prefix, $base, $path, false);
        }
    }

    if (get_option(TL_PREVIEW_OPTION) && tl_preview_is_site_request($path)) {
        tl_preview_serve('', TL_PREVIEW_ROOT_BASE, $path, true);
    }
    // Nothing served - fall through to WordPress.
}

function tl_preview_is_site_request($path) {
    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
    if ($method !== 'GET' && $method !== 'HEAD') {
        return false; // form posts, comments, admin-ajax
    }
    if ($path === '' || preg_match(TL_PREVIEW_WP_PATHS, $path)) {
        return false;
    }
    foreach (TL_PREVIEW_WP_QUERY as $q) {
        if (isset($_GET[$q])) {
            return false;
        }
    }
    return true;
}

// With $fallback, anything but a 200 (or a redirect) from GitHub returns so
// WordPress answers instead: old WP pages keep working until replaced.
function tl_preview_serve($prefix, $base, $path, $fallback) {
    if ($path === $prefix) {
        wp_redirect($prefix . '/', 301);
        exit;
    }

    $rest = substr($path, strlen($prefix)); // starts with '/'
    if (strpos($rest, '..') !== false) {
        if ($fallback) {
            return;
        }
        status_header(400);
        exit;
    }

    $fresh = isset($_GET['refresh']);
    $key   = 'tl_preview_' . md5($prefix . '|' . $rest);
    $hit   = $fresh ? false : get_transient($key);

    if ($hit === false) {
        $res = wp_remote_get(TL_PREVIEW_ORIGIN . $base . $rest, array('timeout' => 15, 'redirection' => 0));
        if (is_wp_error($res)) {
            if ($fallback) {
                return;
            }
            status_header(502);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Preview temporarily unavailable.';
            exit;
        }

        $code = (int) wp_remote_retrieve_response_code($res);
        $type = (string) wp_remote_retrieve_header($res, 'content-type');
        $body = (string) wp_remote_retrieve_body($res);
        $loc  = (string) wp_remote_retrieve_header($res, 'location');

        // GitHub Pages redirects /foo to /foo/ - map that back onto our prefix.
        if ($code >= 300 && $code < 400 && $loc !== '') {
            $locPath = (string) parse_url($loc, PHP_URL_PATH);
            wp_redirect(tl_preview_rebase($locPath), $code);
            exit;
        }

        if ($code === 200 && preg_match('#^(text/|application/(javascript|json|xml|manifest\+json)|image/svg)#i', $type)) {
            $body = tl_preview_rebase($body);
        }

        $hit = array('code' => $code, 'type' => $type, 'body' => $body);
        if ($code === 200 || $code === 404) {
            set_transient($key, $fallback && $code !== 200 ? array('code' => $code) : $hit, TL_PREVIEW_TTL);
        }
    }

    if ($fallback && $hit['code'] !== 200) {
        return;
    }

    status_header($hit['code']);
    if ($hit['type'] !== '') {
        header('Content-Type: ' . $hit['type']);
    }
    header('Cache-Control: public, max-age=' . TL_PREVIEW_TTL);
    if ($prefix !== '') {
        header('X-Robots-Tag: noindex, nofollow'); // keep the previews out of search results
    }
    echo $hit['body'];
    exit;
}

// The GitHub Pages builds link everything under their upstream base; point each
// base (absolute or root-relative) at its local prefix. One pass, longest base
// first, so /torquay-leander/preview/x becomes /preview/x, not /rc/preview/x.
// The lookbehind skips repo URLs like github.com/michal-ciechan/torquay-leander.
function tl_preview_rebase($body) {
    $map = array_flip(TL_PREVIEW_MAPPINGS); // upstream base => local prefix
    if (get_option(TL_PREVIEW_OPTION)) {
        $map[TL_PREVIEW_ROOT_BASE] = ''; // live: master links point at the root, not /rc
    }
    uksort($map, function ($a, $b) {
        return strlen($b) - strlen($a);
    });
    $alts = implode('|', array_map(function ($b) {
        return preg_quote($b, '#');
    }, array_keys($map)));

    $re = '#(?<![\w.-])(?:' . preg_quote(TL_PREVIEW_ORIGIN, '#') . ')?(' . $alts . ')(?=([/"\'?\#)\s]|$))#';
    return preg_replace_callback($re, function ($m) use ($map) {
        $to = $map[$m[1]];
        // A bare "/torquay-leander" at the root becomes "/", not an empty link.
        return ($to === '' && (!isset($m[2]) || $m[2] !== '/')) ? '/' : $to;
    }, $body);
}

// Settings > TL Preview: the switch that puts the new site live at the root.
add_action('admin_init', function () {
    register_setting('tl_preview', TL_PREVIEW_OPTION, array(
        'type'              => 'boolean',
        'sanitize_callback' => 'rest_sanitize_boolean',
        'default'           => false,
    ));
    register_setting('tl_preview', TL_ENQUIRY_TO_OPTION, array(
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_email',
        'default'           => TL_ENQUIRY_TO_DEFAULT,
    ));
    register_setting('tl_preview', TL_ENQUIRY_PREVIEW_TO_OPTION, array(
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_email',
        'default'           => '',
    ));
});

add_action('admin_menu', function () {
    add_options_page('TL Preview', 'TL Preview', 'manage_options', 'tl-preview', 'tl_preview_settings_page');
});

function tl_preview_settings_page() {
    ?>
    <div class="wrap">
        <h1>TL Preview</h1>
        <form method="post" action="options.php">
            <?php settings_fields('tl_preview'); ?>
            <p>
                <label>
                    <input type="checkbox" name="<?php echo esc_attr(TL_PREVIEW_OPTION); ?>" value="1" <?php checked(get_option(TL_PREVIEW_OPTION)); ?> />
                    Serve the new site at <code><?php echo esc_html(home_url('/')); ?></code>
                </label>
            </p>
            <p class="description">
                The signed-off build (the one at <code>/rc/</code>) answers every page it has. WordPress still
                answers wp-admin, logins, the REST API, form posts and any URL the new site does not have.
                Untick to put the WordPress site back.
            </p>
            <h2>Enquiry forms</h2>
            <p>
                <label>
                    Send enquiries to
                    <input type="email" class="regular-text" name="<?php echo esc_attr(TL_ENQUIRY_TO_OPTION); ?>" value="<?php echo esc_attr(tl_enquiry_to()); ?>" />
                </label>
            </p>
            <p>
                <label>
                    Preview enquiries go to
                    <input type="email" class="regular-text" name="<?php echo esc_attr(TL_ENQUIRY_PREVIEW_TO_OPTION); ?>" value="<?php echo esc_attr(get_option(TL_ENQUIRY_PREVIEW_TO_OPTION)); ?>" placeholder="(the address above)" />
                </label>
            </p>
            <p class="description">
                Forms on the <code>/preview/</code> build and local dev use the preview address, with
                "[Preview]" in the subject. The site's enquiry forms post to <code><?php echo esc_html(rest_url('tl/v1/enquiry')); ?></code>.
                Every enquiry is also kept under <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . TL_ENQUIRY_TYPE)); ?>">Enquiries</a>,
                so none is lost if an email goes astray.
            </p>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// The host's page cache still holds the old pages - purge it whenever the switch changes.
add_action('update_option_' . TL_PREVIEW_OPTION, 'tl_preview_purge');
add_action('add_option_' . TL_PREVIEW_OPTION, 'tl_preview_purge');

function tl_preview_purge() {
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_tl\\_preview\\_%' OR option_name LIKE '\\_transient\\_timeout\\_tl\\_preview\\_%'");
    if (function_exists('sg_cachepress_purge_cache')) {
        sg_cachepress_purge_cache(); // SiteGround Optimizer
    }
}
