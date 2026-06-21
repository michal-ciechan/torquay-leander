// Custom Astro dev-toolbar app: a "Dev Pages" panel linking to the /dev/ hub and
// its tooling pages. Lives only in the dev toolbar, so it never ships to the
// production build. Registered from astro.config.mjs via addDevToolbarApp (dev only).
import { defineToolbarApp } from 'astro/toolbar';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const links = [
  { label: 'Dev Hub', href: `${base}/dev/`, desc: 'Design exploration index' },
  { label: 'Typography & Contrast', href: `${base}/dev/typography/`, desc: 'Type scale + CTA contrast samples' },
  { label: 'Sponsor Logos', href: `${base}/dev/logos/`, desc: 'Logo rendering checks' },
  { label: 'Sitemap Variations', href: `${base}/dev/sitemaps/`, desc: 'IA explorations' },
];

export default defineToolbarApp({
  init(canvas) {
    const win = document.createElement('astro-dev-toolbar-window');

    const title = document.createElement('h2');
    title.textContent = 'Dev pages';
    title.style.cssText = 'margin:0 0 10px;font-size:14px;font-weight:700;';
    win.appendChild(title);

    for (const l of links) {
      const a = document.createElement('a');
      a.href = l.href;
      a.style.cssText =
        'display:block;padding:9px 11px;margin-bottom:6px;border-radius:8px;' +
        'background:rgba(255,255,255,0.06);text-decoration:none;color:inherit;transition:background .15s;';

      const strong = document.createElement('strong');
      strong.textContent = l.label;
      strong.style.fontSize = '13px';

      const span = document.createElement('span');
      span.textContent = l.desc;
      span.style.cssText = 'display:block;opacity:.6;font-size:12px;margin-top:2px;';

      a.append(strong, span);
      a.addEventListener('mouseenter', () => (a.style.background = 'rgba(255,255,255,0.14)'));
      a.addEventListener('mouseleave', () => (a.style.background = 'rgba(255,255,255,0.06)'));
      win.appendChild(a);
    }

    canvas.appendChild(win);
  },
});
