<?php
/**
 * Plugin Name: TL Preview
 * Description: Serves the new Torquay Leander site (built on GitHub Pages) on this domain so it can be reviewed before the switchover: /preview/ is the work-in-progress build, /rc/ the signed-off release candidate. Deactivate to remove.
 * Version: 1.1.0
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

// Runs before WordPress parses the request, so WP never sees these URLs.
add_action('plugins_loaded', 'tl_preview_maybe_serve', 0);

function tl_preview_maybe_serve() {
    $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
    $path = (string) parse_url($uri, PHP_URL_PATH);

    foreach (TL_PREVIEW_MAPPINGS as $prefix => $base) {
        if ($path === $prefix || strpos($path, $prefix . '/') === 0) {
            tl_preview_serve($prefix, $base, $path);
        }
    }
    // No mapping matched - fall through to WordPress.
}

function tl_preview_serve($prefix, $base, $path) {
    if ($path === $prefix) {
        wp_redirect($prefix . '/', 301);
        exit;
    }

    $rest = substr($path, strlen($prefix)); // starts with '/'
    if (strpos($rest, '..') !== false) {
        status_header(400);
        exit;
    }

    $fresh = isset($_GET['refresh']);
    $key   = 'tl_preview_' . md5($prefix . '|' . $rest);
    $hit   = $fresh ? false : get_transient($key);

    if ($hit === false) {
        $res = wp_remote_get(TL_PREVIEW_ORIGIN . $base . $rest, array('timeout' => 15, 'redirection' => 0));
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

        // GitHub Pages redirects /foo to /foo/ - map that back onto our prefix.
        if ($code >= 300 && $code < 400 && $loc !== '') {
            $locPath = (string) parse_url($loc, PHP_URL_PATH);
            wp_redirect(tl_preview_rebase($locPath), $code);
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

// The GitHub Pages builds link everything under their upstream base; point each
// base (absolute or root-relative) at its local prefix. One pass, longest base
// first, so /torquay-leander/preview/x becomes /preview/x, not /rc/preview/x.
// The lookbehind skips repo URLs like github.com/michal-ciechan/torquay-leander.
function tl_preview_rebase($body) {
    $map = array_flip(TL_PREVIEW_MAPPINGS); // upstream base => local prefix
    uksort($map, function ($a, $b) {
        return strlen($b) - strlen($a);
    });
    $alts = implode('|', array_map(function ($b) {
        return preg_quote($b, '#');
    }, array_keys($map)));

    $re = '#(?<![\w.-])(?:' . preg_quote(TL_PREVIEW_ORIGIN, '#') . ')?(' . $alts . ')(?=[/"\'?\#)\s]|$)#';
    return preg_replace_callback($re, function ($m) use ($map) {
        return $map[$m[1]];
    }, $body);
}
