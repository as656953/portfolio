/**
 * Contact form.
 *
 * EmailJS is lazy-loaded on first interaction rather than blocking <head>,
 * and both alert() calls from the old implementation are replaced by an
 * aria-live status region.
 */

const SDK_URL = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
const PUBLIC_KEY = "4eHroUDtSPtQ32YVC";
const SERVICE_ID = "service_zuwai49";
const TEMPLATE_ID = "template_zujq2yg";

export function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');
  const buttonText = button?.querySelector(".btn__text");
  const defaultLabel = buttonText?.textContent ?? "Send message";

  let sdkPromise = null;

  const loadSdk = () =>
    (sdkPromise ??= new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.onload = () => {
        window.emailjs.init(PUBLIC_KEY);
        resolve(window.emailjs);
      };
      script.onerror = () => reject(new Error("EmailJS failed to load"));
      document.head.appendChild(script);
    }));

  form.addEventListener("focusin", loadSdk, { once: true });

  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  };

  // `form.name` collides with HTMLFormElement.name, which is why the field is
  // named `fullname` — reading it the other way returns the form's own name
  // and silently sends an empty string.
  const value = (name) => form.elements.namedItem(name)?.value.trim() ?? "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // honeypot — a bot filling a visually-hidden field gets a silent success
    if (value("_gotcha")) {
      setStatus("Thanks — your message is on its way.", "ok");
      form.reset();
      return;
    }

    // validate here rather than relying on the browser bubble, so the error
    // lands in the aria-live region and focus moves to the offending field
    const required = ["fullname", "email", "subject", "message"];
    let firstInvalid = null;

    for (const name of required) {
      const field = form.elements.namedItem(name);
      const invalid = !field.value.trim() || !field.checkValidity();
      field.setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstInvalid) firstInvalid = field;
    }

    if (firstInvalid) {
      setStatus("Please check the highlighted fields and try again.", "error");
      firstInvalid.focus();
      return;
    }

    button.disabled = true;
    if (buttonText) buttonText.textContent = "Sending…";
    setStatus("Sending your message…");

    try {
      const sdk = await loadSdk();
      await sdk.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: value("fullname"),
        from_email: value("email"),
        subject: value("subject"),
        message: value("message"),
        to_name: "Aditya Singh",
      });
      setStatus("Thanks — your message is on its way.", "ok");
      form.reset();
      required.forEach((name) =>
        form.elements.namedItem(name)?.removeAttribute("aria-invalid")
      );
    } catch (error) {
      setStatus(
        "That didn't send. Email me directly at workingadityasingh@gmail.com.",
        "error"
      );
    } finally {
      button.disabled = false;
      if (buttonText) buttonText.textContent = defaultLabel;
    }
  });
}
