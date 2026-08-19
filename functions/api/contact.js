const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const clean = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const allowedTopics = new Set([
  "Collaboration",
  "Feature",
  "Remix",
  "Label / business",
  "Other"
]);

const verifyTurnstile = async ({ token, secret, remoteIp, expectedHostname }) => {
  const body = new URLSearchParams({
    secret,
    response: token
  });

  if (remoteIp) body.set("remoteip", remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal
    });

    if (!response.ok) {
      return { valid: false, reason: "siteverify_unavailable" };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        valid: false,
        reason: "challenge_failed",
        errors: result["error-codes"] || []
      };
    }

    if (result.action !== "contact") {
      return { valid: false, reason: "action_mismatch" };
    }

    if (result.hostname !== expectedHostname) {
      return { valid: false, reason: "hostname_mismatch" };
    }

    return { valid: true };
  } catch (_) {
    return { valid: false, reason: "siteverify_error" };
  } finally {
    clearTimeout(timeout);
  }
};

export async function onRequestPost(context) {
  const { request, env } = context;
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > 40000) {
    return json({ ok: false, error: "Message is too large." }, 413);
  }

  let data;
  try {
    data = await request.formData();
  } catch (_) {
    return json({ ok: false, error: "Invalid form data." }, 400);
  }

  // Honeypot: pretend success so simple form-filling bots get no useful signal.
  if (clean(data.get("website"), 200)) {
    return json({ ok: true });
  }

  const name = clean(data.get("name"), 80);
  const sender = clean(data.get("email"), 160).toLowerCase();
  const topicRaw = clean(data.get("topic"), 80);
  const topic = allowedTopics.has(topicRaw) ? topicRaw : "Other";
  const message = clean(data.get("message"), 5000);

  if (name.length < 2 || !emailLooksValid(sender) || message.length < 10) {
    return json({ ok: false, error: "Please check the form fields and try again." }, 400);
  }

  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const turnstileToken = clean(data.get("cf-turnstile-response"), 2048);

  if (!turnstileSecret) {
    return json({ ok: false, error: "Spam protection is not configured." }, 503);
  }

  if (!turnstileToken) {
    return json({ ok: false, error: "Security check is required." }, 403);
  }

  const verification = await verifyTurnstile({
    token: turnstileToken,
    secret: turnstileSecret,
    remoteIp: request.headers.get("CF-Connecting-IP") || "",
    expectedHostname: new URL(request.url).hostname
  });

  if (!verification.valid) {
    console.warn("Turnstile rejected contact submission", verification.reason, verification.errors || []);
    return json({ ok: false, error: "Security check failed. Please try again." }, 403);
  }

  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return json({ ok: false, error: "Mail endpoint is not configured." }, 503);
  }

  const safeName = escapeHtml(name);
  const safeSender = escapeHtml(sender);
  const safeTopic = escapeHtml(topic);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
  const subject = `[v3 breaks] ${topic} - ${name}`;
  const text = `Name: ${name}\nEmail: ${sender}\nTopic: ${topic}\n\n${message}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#11110f">
      <p><strong>Name:</strong> ${safeName}<br>
      <strong>Email:</strong> ${safeSender}<br>
      <strong>Topic:</strong> ${safeTopic}</p>
      <p>${safeMessage}</p>
    </div>
  `;

  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: sender,
        subject,
        text,
        html
      })
    });
  } catch (_) {
    return json({ ok: false, error: "Mail service is unreachable." }, 502);
  }

  if (!response.ok) {
    console.error("Contact mail send failed", response.status);
    return json({ ok: false, error: "Mail service rejected the message." }, 502);
  }

  return json({ ok: true });
}

export function onRequestGet() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
