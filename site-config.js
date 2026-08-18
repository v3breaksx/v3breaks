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
    kicker: "independent electronic producer",
    tagline: "I do whatever I want",
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
      meta: "stream",
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
      meta: "stream",
    },
  ],

  latestRelease: {
    title: "I live my life in a false awakening",
    type: "Single",
    year: "2026",
    artwork: "assets/1691.png",
    links: [],
  },

  support: [
    {
      name: "Bandcamp",
      url: "https://v3breaks.bandcamp.com/",
    },
    {
      name: "Ko-fi",
      url: "ko-fi.com/v3breaks",
    },
    {
      name: "PayPal",
      url: "",
    },
  ],

  contact: {
    email: "v3breaks@gmail.com",
    endpoint: "/api/contact",
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
  ],
};
