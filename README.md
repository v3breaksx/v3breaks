# v3 breaks website

Production-ready static artist site for **v3 breaks**, deployed on Cloudflare Pages. No front-end framework or package manager is required.

## Current structure

- streaming-first homepage
- animated `<3` / `v3` mini logo
- editable music/support/social links in `site-config.js`
- direct contact form via `functions/api/contact.js`
- Resend email delivery
- Cloudflare Turnstile spam protection with server-side verification
- custom-domain metadata for `https://v3breaks.com/`
- sitemap, robots, CSP/security headers and custom 404

## Edit music/content

Open `site-config.js`. This is the main file for platform URLs, release details, artwork, support links and socials.

The current artwork path and the other content/design changes from the supplied version have been preserved.

## Cloudflare production variables

Under **Workers & Pages > v3breaks > Settings > Variables and Secrets**, keep:

- `RESEND_API_KEY` — encrypted Secret
- `CONTACT_TO_EMAIL` — private destination inbox
- `CONTACT_FROM_EMAIL` — Resend sender
- `TURNSTILE_SECRET_KEY` — encrypted Secret

The Turnstile **Site Key** is public and lives in `site-config.js`.

## Turnstile

Allow `v3breaks.com` in the Turnstile widget's hostname settings. Keep `v3breaks.pages.dev` temporarily while testing. The Pages Function validates the challenge server-side and checks the `contact` action and request hostname before sending mail.

## Custom domain

Attach `v3breaks.com` to the existing Cloudflare Pages project. Do not create another Pages project. The HTML now declares `https://v3breaks.com/` as the canonical URL.

## Resend

After verifying `v3breaks.com` in Resend, `CONTACT_FROM_EMAIL` can be something like:

```text
v3 breaks <website@v3breaks.com>
```

The receiving inbox can still be your private Gmail address through `CONTACT_TO_EMAIL`.

## Deploy

Commit changes to the connected GitHub `main` branch. Cloudflare Pages will deploy automatically.

See `GO_LIVE_V3BREAKS_COM.txt`, `TURNSTILE_SETUP.txt`, and `SECURITY_NOTES.txt` for the launch/security checklist.
