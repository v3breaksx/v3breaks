/*
  v3 breaks — QUICK EDIT FILE
  ---------------------------
  This is the main file to edit when links, release information, support links,
  socials, or contact details change.

  Leave a URL as an empty string ("") to hide that button automatically.
*/

window.v3Config = {
  artist: {
    name: "v3 breaks",
    kicker: "independent electronic music",
    tagline: "Fast breaks, fractured atmosphere, late-night emotion.",
  },

  platforms: [
    {
      name: "Spotify",
      url: "https://open.spotify.com/artist/6aldeROmb108VI4Jcl51Ct",
      priority: true,
      meta: "stream",
    },
    {
      name: "Bandcamp",
      url: "https://v3breaks.bandcamp.com/",
      priority: true,
      meta: "listen",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@v3breaks",
      priority: true,
      meta: "stream",
    },
    {
      name: "Apple Music",
      url: "https://music.apple.com/us/artist/v3-breaks/1711872313",
      priority: false,
      meta: "stream",
    },
    {
      name: "SoundCloud",
      url: "https://soundcloud.com/v3breaksx",
      priority: false,
      meta: "listen",
    },
  ],

  latestRelease: {
    title: "I live my life in a false awakening",
    type: "Single",
    year: "2026",
    description:
      "Find the latest music from v3 breaks on your preferred platform.",
    artwork: "assets/1691.jpg",
    links: [],
  },

  support: [
    {
      name: "Bandcamp",
      url: "https://v3breaks.bandcamp.com/",
    },
    {
      name: "Ko-fi",
      url: "https://ko-fi.com/v3breaks",
    },
    {
      name: "PayPal",
      url: "",
    },
  ],

  contact: {
    endpoint: "/api/contact",
  },

  // Turnstile site keys are PUBLIC and safe to keep in this file.
  // Paste the Site Key from Cloudflare Turnstile here. Keep the Secret Key
  // only in Cloudflare Pages as TURNSTILE_SECRET_KEY.
  security: {
    turnstileSiteKey: "0x4AAAAAAEUtOTkgolmvPjRU",
  },

  socials: [
    {
      name: "Spotify",
      url: "https://open.spotify.com/artist/6aldeROmb108VI4Jcl51Ct",
    },
    { name: "YouTube", url: "https://www.youtube.com/@v3breaks" },
    {
      name: "Apple Music",
      url: "https://music.apple.com/us/artist/v3-breaks/1711872313",
    },
    { name: "Bandcamp", url: "https://v3breaks.bandcamp.com/" },
    { name: "SoundCloud", url: "https://soundcloud.com/v3breaksx" },
    { name: "TikTok", url: "https://www.tiktok.com/@v3breaks" },
    { name: "Instagram", url: "https://soundcloud.com/v3breaksx" },
  ],
};
