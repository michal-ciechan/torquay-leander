<?php
/**
 * Plugin Name: TL Preview
 * Description: Serves the new Torquay Leander site (built on GitHub Pages) at /preview/ on this domain, so it can be reviewed before the switchover. Deactivate to remove.
 * Version: 1.0.0
 * Author: Mike Ciechan
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

const TL_PREVIEW_PREFIX   = '/preview';
const TL_PREVIEW_UPSTREAM = 'https://michal-ciechan.github.io/torquay-leander';
const TL_PREVIEW_BASE     = '/torquay-leander';
const TL_PREVIEW_TTL      = 300; // seconds a fetched file is cached

// Runs before WordPress parses the request, so WP never sees /preview URLs.
add_action('plugins_loaded', 'tl_preview_maybe_serve', 0);

function tl_preview_maybe_serve() {
    $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
    $path = (string) parse_url($uri, PHP_URL_PATH);

    if ($path !== TL_PREVIEW_PREFIX && strpos($path, TL_PREVIEW_PREFIX . '/') !== 0) {
        return;
    }
    if ($path === TL_PREVIEW_PREFIX) {
        wp_redirect(TL_PREVIEW_PREFIX . '/', 301);
        exit;
    }

    $rest = substr($path, strlen(TL_PREVIEW_PREFIX)); // starts with '/'
    if (strpos($rest, '..') !== false) {
        status_header(400);
        exit;
    }

    $fresh = isset($_GET['refresh']);
    $key   = 'tl_preview_' . md5($rest);
    $hit   = $fresh ? false : get_transient($key);

    if ($hit === false) {
        $res = wp_remote_get(TL_PREVIEW_UPSTREAM . $rest, array('timeout' => 15, 'redirection' => 0));
        if (is_wp_error($res)) {
            status_header(502);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Preview temporarily unavailable.';
            exit;
        }

        $code = (int) wp_remote_retrieve_response_code($res);
        $type = (string) wp_remote_retrieve_header($res, 'content-type');
        $body = (string) wp_remote_retrieve_body($res);
        $loc  = (string) wp_remote_retrieve_header($res, 'location');

        // GitHub Pages redirects /foo to /foo/ - map that back onto /preview.
        if ($code >= 300 && $code < 400 && $loc !== '') {
            $locPath = (string) parse_url($loc, PHP_URL_PATH);
            if (strpos($locPath, TL_PREVIEW_BASE) === 0) {
                $locPath = TL_PREVIEW_PREFIX . substr($locPath, strlen(TL_PREVIEW_BASE));
            }
            wp_redirect($locPath, $code);
            exit;
        }

        if (preg_match('#^(text/|application/(javascript|json|xml|manifest\+json)|image/svg)#i', $type)) {
            $body = tl_preview_rebase($body);
        }

        $hit = array('code' => $code, 'type' => $type, 'body' => $body);
        if ($code === 200 || $code === 404) {
            set_transient($key, $hit, TL_PREVIEW_TTL);
        }
    }

    status_header($hit['code']);
    if ($hit['type'] !== '') {
        header('Content-Type: ' . $hit['type']);
    }
    header('Cache-Control: public, max-age=' . TL_PREVIEW_TTL);
    header('X-Robots-Tag: noindex, nofollow'); // keep the preview out of search results
    echo $hit['body'];
    exit;
}

// The GitHub Pages build links everything under /torquay-leander; point those at /preview.
// The lookbehind skips repo URLs like github.com/michal-ciechan/torquay-leander.
function tl_preview_rebase($body) {
    $body = str_replace(TL_PREVIEW_UPSTREAM, TL_PREVIEW_PREFIX, $body);
    return preg_replace('#(?<![\w.-])' . preg_quote(TL_PREVIEW_BASE, '#') . '(?=[/"\'?\#)\s]|$)#', TL_PREVIEW_PREFIX, $body);
}
