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

  const form = $("#contact-form");
  const formStatus = $("#form-status");
  if (form && formStatus) {
    const submitButton = form.querySelector(".submit-button");
    const submitLabel = form.querySelector(".submit-label");
    const defaultSubmitLabel = submitLabel.textContent;
    const turnstileContainer = $("#turnstile-container");
    const turnstileSiteKey = String(config.security?.turnstileSiteKey || "").trim();
    const turnstileConfigured = Boolean(
      turnstileSiteKey && !turnstileSiteKey.includes("PASTE_YOUR_")
    );

    let turnstileWidgetId = null;
    let turnstileToken = "";
    let pendingTurnstileSubmit = false;
    let challengeTimer = null;

    const setFormStatus = (message = "", state = "") => {
      formStatus.textContent = message;
      formStatus.classList.toggle("is-success", state === "success");
      formStatus.classList.toggle("is-error", state === "error");
    };

    const setSending = (sending, checking = false) => {
      form.classList.toggle("is-sending", sending);
      form.classList.toggle("is-checking", checking);
      submitButton.disabled = sending;
    };

    const clearChallengeTimer = () => {
      if (challengeTimer) {
        window.clearTimeout(challengeTimer);
        challengeTimer = null;
      }
    };

    const resetTurnstile = () => {
      clearChallengeTimer();
      pendingTurnstileSubmit = false;
      turnstileToken = "";
      if (turnstileWidgetId !== null && window.turnstile) {
        try {
          window.turnstile.reset(turnstileWidgetId);
        } catch (_) {
          // A page navigation or widget teardown can make reset unnecessary.
        }
      }
    };

    const sendContactForm = async () => {
      pendingTurnstileSubmit = false;
      clearChallengeTimer();

      const data = new FormData(form);
      data.set("name", String(data.get("name") || "").trim());
      data.set("email", String(data.get("email") || "").trim());
      data.set("message", String(data.get("message") || "").trim());
      data.set("cf-turnstile-response", turnstileToken);

      const endpoint = config.contact.endpoint || form.getAttribute("action") || "/api/contact";
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);

      setSending(true, false);
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
      } catch (error) {
        setFormStatus(error?.message || "Could not send right now. Please try again in a moment.", "error");
        submitLabel.textContent = defaultSubmitLabel;
      } finally {
        window.clearTimeout(timeout);
        setSending(false, false);
        resetTurnstile();
      }
    };

    const initTurnstile = () => {
      if (!turnstileConfigured || !turnstileContainer || !window.turnstile) return false;
      if (turnstileWidgetId !== null) return true;

      try {
        turnstileWidgetId = window.turnstile.render(turnstileContainer, {
          sitekey: turnstileSiteKey,
          action: "contact",
          execution: "execute",
          appearance: "interaction-only",
          theme: "light",
          callback: (token) => {
            turnstileToken = token;
            clearChallengeTimer();
            if (pendingTurnstileSubmit) {
              sendContactForm();
            }
          },
          "error-callback": () => {
            resetTurnstile();
            setSending(false, false);
            submitLabel.textContent = defaultSubmitLabel;
            setFormStatus("Security check could not complete. Please try again.", "error");
          },
          "expired-callback": () => {
            turnstileToken = "";
          },
          "timeout-callback": () => {
            resetTurnstile();
            setSending(false, false);
            submitLabel.textContent = defaultSubmitLabel;
            setFormStatus("Security check timed out. Please try again.", "error");
          }
        });
        return true;
      } catch (_) {
        return false;
      }
    };

    if (turnstileConfigured) {
      initTurnstile();
      window.addEventListener("load", initTurnstile, { once: true });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      setFormStatus();

      if (!form.reportValidity()) return;

      const preflight = new FormData(form);
      if (String(preflight.get("website") || "").trim()) {
        form.reset();
        setFormStatus("Message sent. Thank you.", "success");
        return;
      }

      if (!turnstileConfigured) {
        setFormStatus("Spam protection is not configured yet. Add your Cloudflare Turnstile Site Key first.", "error");
        return;
      }

      if (!initTurnstile() || turnstileWidgetId === null) {
        setFormStatus("Security check is still loading. Try again in a moment.", "error");
        return;
      }

      pendingTurnstileSubmit = true;
      setSending(true, true);
      submitLabel.textContent = "Checking...";

      challengeTimer = window.setTimeout(() => {
        resetTurnstile();
        setSending(false, false);
        submitLabel.textContent = defaultSubmitLabel;
        setFormStatus("Security check took too long. Please try again.", "error");
      }, 20000);

      try {
        window.turnstile.execute(turnstileWidgetId);
      } catch (_) {
        resetTurnstile();
        setSending(false, false);
        submitLabel.textContent = defaultSubmitLabel;
        setFormStatus("Security check could not start. Please refresh and try again.", "error");
      }
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
