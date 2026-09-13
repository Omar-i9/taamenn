import { config } from './config.mjs';

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

export function contactConfigured() {
  const { recipient, emailjsServiceId, emailjsContactTemplateId, emailjsPublicKey } = config.contact;
  return Boolean(recipient && emailjsServiceId && emailjsContactTemplateId && emailjsPublicKey);
}

async function send(templateId, params) {
  const payload = {
    service_id: config.contact.emailjsServiceId,
    template_id: templateId,
    user_id: config.contact.emailjsPublicKey,
    template_params: params,
  };
  // EmailJS requires the private key for non-browser callers.
  if (config.contact.emailjsPrivateKey) payload.accessToken = config.contact.emailjsPrivateKey;

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

/**
 * The recipient comes from server configuration only. The caller supplies the
 * reply address and message body, never the destination.
 */
export async function sendContactMessage({ email, message, name }) {
  const delivered = await send(config.contact.emailjsContactTemplateId, {
    to_email: config.contact.recipient,
    to_name: 'TAAMEN Support',
    from_name: name || 'TAAMEN user',
    reply_to: email,
    message,
    app_name: 'TAAMEN 2.0',
  });
  if (!delivered) return false;

  if (config.contact.emailjsAutoReplyTemplateId) {
    try {
      await send(config.contact.emailjsAutoReplyTemplateId, {
        to_email: email,
        to_name: name || 'TAAMEN user',
        message: 'We received your message and will review it and reply as soon as possible.',
        app_name: 'TAAMEN 2.0',
      });
    } catch {
      // The acknowledgement is best-effort; the support message already went out.
    }
  }
  return true;
}
