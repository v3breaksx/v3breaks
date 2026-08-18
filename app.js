(() => {
  "use strict";

  const config = window.v3Config;
  if (!config) return;

  const $ = (selector) => document.querySelector(selector);
  const visible = (items = []) => items.filter((item) => item.url && item.url.trim());
  const setText = (selector, value) => {
    const node = $(selector);
    if (node) node.textContent = value;
  };

  const makeAction = (item, primary = false) => {
    const link = document.createElement("a");
    link.className = `action-link${primary ? " primary" : ""}`;
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = `<span>${item.name}</span><span aria-hidden="true">&#8599;</span>`;
    return link;
  };

  setText("#artist-kicker", config.artist.kicker);
  setText("#artist-tagline", config.artist.tagline);

  const heroActions = $("#hero-actions");
  if (heroActions) {
    visible(config.platforms)
      .filter((item) => item.priority)
      .slice(0, 3)
      .forEach((item, index) => heroActions.appendChild(makeAction(item, index === 0)));
  }

  const platformGrid = $("#platform-grid");
  if (platformGrid) {
    visible(config.platforms).forEach((item, index) => {
      const link = document.createElement("a");
      link.className = "platform-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = `
        <span class="platform-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="platform-name">${item.name}</span>
        <span class="platform-meta">${item.meta || "listen"}</span>
        <span class="platform-arrow" aria-hidden="true">&#8599;</span>
      `;
      platformGrid.appendChild(link);
    });
  }

  const release = config.latestRelease;
  setText("#hero-release-title", release.title);
  setText("#release-title", release.title);
  setText("#release-meta", [release.type, release.year].filter(Boolean).join(" / "));
  setText("#release-description", release.description);

  const releaseArt = $("#release-art");
  if (releaseArt) {
    releaseArt.src = release.artwork;
    releaseArt.alt = `${release.title} - ${config.artist.name} artwork`;
  }

  const releaseLinks = $("#release-links");
  if (releaseLinks) {
    visible(release.links).forEach((item, index) => releaseLinks.appendChild(makeAction(item, index === 0)));
  }

  const supportLinks = $("#support-links");
  if (supportLinks) {
    visible(config.support).forEach((item, index) => supportLinks.appendChild(makeAction(item, index === 0)));
  }

  const emailLink = $("#email-link");
  if (emailLink) {
    emailLink.textContent = config.contact.email;
    emailLink.href = `mailto:${config.contact.email}`;
  }

  const form = $("#contact-form");
  const formStatus = $("#form-status");
  if (form && formStatus) {
    const submitButton = form.querySelector(".submit-button");
    const submitLabel = form.querySelector(".submit-label");
    const defaultSubmitLabel = submitLabel.textContent;

    const setFormStatus = (message = "", state = "") => {
      formStatus.textContent = message;
      formStatus.classList.toggle("is-success", state === "success");
      formStatus.classList.toggle("is-error", state === "error");
    };

    const setSending = (sending) => {
      form.classList.toggle("is-sending", sending);
      submitButton.disabled = sending;
    };

    const buildMailto = (data) => {
      const name = String(data.get("name") || "").trim();
      const sender = String(data.get("email") || "").trim();
      const topic = String(data.get("topic") || "Other").trim();
      const message = String(data.get("message") || "").trim();
      const subject = `[v3 breaks] ${topic} - ${name}`;
      const body = `Name: ${name}
Email: ${sender}
Topic: ${topic}

${message}`;
      return `mailto:${encodeURIComponent(config.contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFormStatus();

      if (!form.reportValidity()) return;

      const data = new FormData(form);
      if (String(data.get("website") || "").trim()) {
        form.reset();
        setFormStatus("Message sent. Thank you.", "success");
        return;
      }

      data.set("name", String(data.get("name") || "").trim());
      data.set("email", String(data.get("email") || "").trim());
      data.set("message", String(data.get("message") || "").trim());

      const endpoint = config.contact.endpoint || form.getAttribute("action") || "/api/contact";
      const mailto = buildMailto(data);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 9000);

      setSending(true);
      submitLabel.textContent = "Sending...";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
          signal: controller.signal
        });

        let payload = {};
        try {
          payload = await response.json();
        } catch (_) {
          payload = {};
        }

        if (!response.ok || payload.ok === false) {
          throw new Error(payload.error || "Direct send unavailable");
        }

        form.reset();
        setFormStatus("Sent. Thanks - your message is on its way.", "success");
        submitLabel.textContent = "Message sent";
        window.setTimeout(() => {
          submitLabel.textContent = defaultSubmitLabel;
        }, 3200);
      } catch (_) {
        setFormStatus("Direct send is unavailable right now. Opening your email app with the message pre-filled instead.", "error");
        submitLabel.textContent = "Opening email...";
        window.setTimeout(() => {
          window.location.href = mailto;
          window.setTimeout(() => {
            submitLabel.textContent = defaultSubmitLabel;
          }, 1200);
        }, 350);
      } finally {
        window.clearTimeout(timeout);
        setSending(false);
      }
    });
  }

  const copyButton = $("#copy-email");
  const copyFallback = (text) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  };

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const original = copyButton.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(config.contact.email);
        } else {
          copyFallback(config.contact.email);
        }
        copyButton.textContent = "Copied";
      } catch (_) {
        copyButton.textContent = "Copy failed";
      }
      window.setTimeout(() => {
        copyButton.textContent = original;
      }, 1600);
    });
  }

  const socialLinks = $("#social-links");
  if (socialLinks) {
    visible(config.socials).forEach((item) => {
      const link = document.createElement("a");
      link.className = "social-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.name;
      socialLinks.appendChild(link);
    });
  }

  setText("#year", new Date().getFullYear());
})();
