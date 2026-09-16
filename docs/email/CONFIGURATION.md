# EmailJS configuration (server only)

Support mail is sent by the TAAMEN backend. Do not put EmailJS identifiers in `VITE_*` variables or the frontend bundle.

Authoritative provider IDs:

```text
Service ID:
service_13mkb9h

Public Key:
7xyuge5ZLIgBevcbL

Contact:
template_jsugxta

Auto Reply:
template_4pj4xlm
```

Configure these on the backend host only (`backend/.env`):

```env
TAAMEN_SUPPORT_RECIPIENT=
EMAILJS_SERVICE_ID=service_13mkb9h
EMAILJS_CONTACT_TEMPLATE_ID=template_jsugxta
EMAILJS_AUTOREPLY_TEMPLATE_ID=template_4pj4xlm
EMAILJS_PUBLIC_KEY=7xyuge5ZLIgBevcbL
EMAILJS_PRIVATE_KEY=
```

`TAAMEN_SUPPORT_RECIPIENT` is optional when the Contact template To field is already set in the EmailJS dashboard. If the env var is set, the backend sends it as `to_email` (the client still cannot choose the destination). Leave the example empty.

`EMAILJS_PRIVATE_KEY` is required only when EmailJS Account → Security has “Use Private Key” enabled. Never put it in `VITE_*` or the client bundle.

If Account → Security has “Allow EmailJS API for non-browser applications” disabled, the backend sends a local `Origin` header so the existing service can accept server-side sends. Enabling that dashboard option (and a private key) is the preferred production setting.

The contact form posts to `POST /api/public/contact`. The recipient, service ID, and template IDs are chosen by the server, never by the client. A missing configuration returns HTTP 503.

SMTP From is the EmailJS service identity. The user’s address is Reply-To (`reply_to` / `email`), not From.
