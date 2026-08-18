# v3 breaks artist website

A lightweight single-page site for v3 breaks. No framework or package manager is required for the front end.

## What changed in this version

- subtle animated blue/paper background haze so the page feels alive without changing the visual language
- looping hero identity animation: `<3 breaks` fractures into `v3 breaks`, then repeats
- more tactile square-edged buttons, arrows, platform rows, and cover hover motion
- improved contact UX with validation, status messages, a copy-email control, and a spam honeypot
- optional same-site `/api/contact` endpoint for direct form sending
- automatic `mailto:` fallback if the direct mail endpoint is unavailable
- reduced-motion support is preserved
- hero text spacing fixed so `v3` and `breaks` do not overlap
- after 3 seconds, an idle visitor smoothly scrolls to the Listen section
- real Spotify, YouTube, Apple Music, Bandcamp, and SoundCloud links added

## 1. Edit music and contact details

Open `site-config.js`.

It contains:

- artist tagline
- platform links
- latest release title, year, description, artwork, and release links
- support links
- contact email and form endpoint
- social links

Leave a URL as an empty string (`""`) to hide that button automatically.

## 2. Contact form: simple fallback mode

The site works without a backend. If `/api/contact` cannot send, the browser opens the visitor's email app with the message pre-filled.

Change the public contact address in `site-config.js`:

```js
contact: {
  email: "v3breaks@gmail.com",
  endpoint: "/api/contact"
}
```

## 3. Contact form: direct-send mode on Cloudflare Pages

This package includes:

`functions/api/contact.js`

That function validates the form on the server and sends the message through the Resend HTTP API. The API key stays on the server and is never shipped to the browser.

Set these Cloudflare Pages variables/secrets before deployment:

- `RESEND_API_KEY` - your Resend API key
- `CONTACT_TO_EMAIL` - where messages should arrive, for example `v3breaks@gmail.com`
- `CONTACT_FROM_EMAIL` - the verified sender used by Resend. You can ignore direct-send mode for now if you do not own a domain yet; the site will fall back to opening the visitor's email app.

The visitor's address is set as the email `reply_to`, so replying from your inbox goes back to the person who submitted the form.

The included `_routes.json` limits Pages Function invocation to `/api/*`.

Important: when using the included Pages Function, deploy through Git integration or Wrangler rather than dashboard drag-and-drop/direct upload.

If you do not want Resend, replace the code inside `functions/api/contact.js` with your preferred mail provider. The front end only expects a successful JSON response shaped like:

```json
{ "ok": true }
```

## 4. Resend setup

1. Create a Resend account.
2. Add and verify the domain you want to send from.
3. Create an API key.
4. Put that key into the Cloudflare `RESEND_API_KEY` secret.
5. Set `CONTACT_FROM_EMAIL` to an address at the verified domain.
6. Redeploy the Pages project after changing environment variables.

## 5. Replace the release artwork

Put an optimized square cover in `assets/`, for example:

`assets/latest-release.webp`

Then change this line in `site-config.js`:

```js
artwork: "assets/latest-release.webp"
```

A 1200 x 1200 export is a good default. The included SVG is a lightweight placeholder.

## 6. Hero animation tuning

The `<3` to `v3` loop is CSS-only and lives near the bottom of `styles.css` under:

`Heart-to-v3 identity loop`

The full cycle is currently 6.2 seconds. Search for `6.2s` in that section if you want it slower or faster.

The page already respects `prefers-reduced-motion`, so visitors who disable animation will not get the continuous motion.

## 7. Background motion tuning

The living background is the `.ambient-field` layer in `styles.css`.

Useful values to tune:

- `rgba(45, 53, 255, .13)` - strength of the main blue glow
- `18s` in `ambient-drift` - speed of the page background
- `13s` in `release-breathe` - speed of the dark release-section glow

Keep these values subtle if you want to preserve the current editorial / independent-label feel.

## 8. Run locally

For the static front end:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

The direct mail endpoint will not run under Python's static server, so form submission will intentionally fall back to `mailto:`.

For the Cloudflare Pages Function locally, use the current Cloudflare Wrangler Pages development workflow and provide the required environment variables/secrets.

## 9. SEO and sharing

You said you do not own `v3breaks.com` yet, so this version does **not** claim that domain in the canonical URL, robots file, or structured-data URL. That is intentional.

After you publish the site and know its real web address, update the sharing URLs in `index.html`. If you later buy a custom domain, you can add a sitemap then.

For social previews, a raster 1200 x 630 image is usually a safer choice than the placeholder SVG.

## 10. Design system

The original direction is preserved:

- paper: `#f2efe7`
- ink: `#11110f`
- muted: `#6d6962`
- divider: `#c9c4b8`
- electric blue: `#2d35ff`
- square edges, thin rules, large editorial type
- Arial/Helvetica for structure with Georgia italic as contrast
- no external font requests
- no analytics, cookies, or framework runtime by default

## Mark animation

The hero identity uses a fast three-slice hard cut between `<3` and `v3`. The transition deliberately avoids rotation, bounce, scale pops, or a decorative crack; the word “breaks” stays completely still while only the black mark fractures for roughly 0.2 seconds. Edit the `heart-cut` and `v3-cut` keyframes in `styles.css` to change timing.

bob
