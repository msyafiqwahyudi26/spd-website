const nodemailer = require('nodemailer');

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = process.env;

// Inbound admin inbox. Defaults to info@spdindonesia.org so contact form
// notifications land somewhere sensible even without explicit EMAIL_TO.
const EMAIL_TO = process.env.EMAIL_TO || 'info@spdindonesia.org';

const REQUIRED_KEYS = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
const missingKeys = REQUIRED_KEYS.filter((k) => !process.env[k]);
const isConfigured = missingKeys.length === 0;

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT || '587', 10),
    secure: parseInt(EMAIL_PORT || '587', 10) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHeaderChars(str = '') {
  // Prevent CRLF injection in headers (subject).
  return String(str).replace(/[\r\n]+/g, ' ').trim();
}

function validateConfig() {
  return {
    configured: isConfigured,
    missing: missingKeys,
    missingInbound: !process.env.EMAIL_TO,
    inboundTarget: EMAIL_TO,
  };
}

/**
 * Fire-and-forget contact notification to the admin inbox.
 * Resolves with { ok: boolean, reason?: string } so callers can log the
 * outcome without needing to catch. Never throws.
 */
async function sendContactNotification({ name, email, message }) {
  if (!transporter) return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' };
  try {
    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_TO,
      subject: stripHeaderChars(`[SPD Website] Pesan baru dari ${name}`),
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: `
        <p><strong>Nama:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Pesan:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err && err.message ? err.message : 'UNKNOWN_ERROR' };
  }
}

/**
 * Admin-triggered test. Sends a minimal "delivery works" email to the
 * configured inbox so the admin can confirm SMTP credentials without
 * having to subscribe to their own newsletter. Never throws.
 */
async function sendTestEmail() {
  if (!transporter) return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' };
  try {
    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_TO,
      subject: stripHeaderChars('[SPD] Uji pengiriman email'),
      text: `Pengiriman email dari SPD backend berhasil.

Dikirim pada: ${new Date().toISOString()}

Tidak perlu dibalas — ini pesan uji dari administrator.`,
      html: `
        <p>Pengiriman email dari <strong>SPD backend</strong> berhasil.</p>
        <p style="color:#64748b;font-size:13px">Dikirim pada ${new Date().toISOString()}. Tidak perlu dibalas — ini pesan uji dari administrator.</p>
      `,
    });
    return { ok: true, target: EMAIL_TO };
  } catch (err) {
    return { ok: false, reason: err && err.message ? err.message : 'UNKNOWN_ERROR' };
  }
}

/**
 * Fire-and-forget welcome email to the subscriber themselves.
 * Short, friendly, no-surprise. Never throws.
 */
async function sendSubscriberWelcome({ email }) {
  if (!transporter) return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' };
  try {
    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: email,
      subject: stripHeaderChars('Terima kasih telah berlangganan SPD Indonesia'),
      text: `Halo,

Terima kasih sudah berlangganan newsletter Sindikasi Pemilu dan Demokrasi (SPD).
Anda akan menerima riset, opini, dan analisis terbaru kami melalui email ini.

Jika ini bukan Anda, abaikan pesan ini — alamat tidak akan dipakai tanpa
konfirmasi lebih lanjut.

Salam,
Tim SPD Indonesia
`,
      html: `
        <p>Halo,</p>
        <p>Terima kasih sudah berlangganan newsletter <strong>Sindikasi Pemilu dan Demokrasi (SPD)</strong>. Anda akan menerima riset, opini, dan analisis terbaru kami melalui email ini.</p>
        <p style="color:#64748b;font-size:13px">Jika ini bukan Anda, abaikan pesan ini — alamat tidak akan dipakai tanpa konfirmasi lebih lanjut.</p>
        <p>Salam,<br/>Tim SPD Indonesia</p>
      `,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err && err.message ? err.message : 'UNKNOWN_ERROR' };
  }
}

/**
 * Fire-and-forget new-subscriber notification to the admin inbox.
 * Never throws; returns { ok, reason? } for optional logging.
 */
async function sendSubscriberNotification({ email }) {
  if (!transporter) return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' };
  try {
    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_TO,
      subject: stripHeaderChars('[SPD Website] Pelanggan newsletter baru'),
      text: `Email baru berlangganan newsletter: ${email}`,
      html: `<p>Email baru berlangganan newsletter: <strong>${escapeHtml(email)}</strong></p>`,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err && err.message ? err.message : 'UNKNOWN_ERROR' };
  }
}

/**
 * Admin-initiated reply to a visitor. Throws on failure so the caller
 * can surface a 502/503 with a meaningful message.
 */
async function sendContactReply({ to, toName, subject, body, adminName }) {
  if (!transporter) {
    const err = new Error('Email belum dikonfigurasi di server');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,
    to,
    subject: stripHeaderChars(subject),
    text: `Halo ${toName},\n\n${body}\n\nSalam,\n${adminName}\nSPD Indonesia`,
    html: `
      <p>Halo ${escapeHtml(toName)},</p>
      <p style="white-space:pre-wrap">${escapeHtml(body)}</p>
      <p>Salam,<br/>${escapeHtml(adminName)}<br/>SPD Indonesia</p>
    `,
  });
}

module.exports = {
  sendContactNotification,
  sendContactReply,
  sendSubscriberNotification,
  sendSubscriberWelcome,
  sendTestEmail,
  isConfigured: () => isConfigured,
  validateConfig,
  EMAIL_TO,
};
