import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn('[notify] RESEND_API_KEY missing — skipping email to', to);
    return { skipped: true };
  }
  return resend.emails.send({
    from: 'Nimbus <alerts@nimbus.insure>',
    to,
    subject,
    html,
  });
}

export async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    console.warn('[notify] TERMII_API_KEY missing — SMS skipped for', phone);
    return { skipped: true };
  }
  const res = await fetch('https://api.ng.termii.com/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: phone,
      from: 'Nimbus',
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: apiKey,
    }),
  });
  if (!res.ok) {
    console.error('[notify] Termii failed', res.status, await res.text());
    return { error: true };
  }
  return res.json();
}
