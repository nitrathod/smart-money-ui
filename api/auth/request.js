// POST /api/auth/request
// Body: { email }
// Sends a 6-digit OTP to email if it's in the allowlist.
// Returns an httpOnly cookie 'auth_challenge' containing a signed JWT
// with the OTP hash, used by /api/auth/verify to confirm the code.

import nodemailer from 'nodemailer';
import { signJWT, hashOTP, generateOTP, getAllowedEmails, cookieFlags } from '../_lib/auth.js';

async function readBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try { body = await readBody(req); }
  catch (e) { return res.status(400).json({ error: 'Invalid JSON body' }); }

  const email = (body?.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const allowed = getAllowedEmails();
  if (allowed.length === 0) {
    return res.status(500).json({ error: 'No allowed emails configured. Set ALLOWED_EMAILS env var.' });
  }
  if (!allowed.includes(email)) {
    // Generic message to avoid email enumeration
    return res.status(403).json({ error: 'This email is not authorized. Contact the admin to request access.' });
  }

  // SMTP must be configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({ error: 'SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.' });
  }

  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const challenge = await signJWT({ email, otpHash, purpose: 'otp' }, '10m');

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: email,
      subject: 'Your NIFTY Tracker login code',
      text: `Your one-time login code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <h2 style="color: #0f172a; margin: 0 0 16px;">NIFTY Smart Money Tracker</h2>
          <p style="color: #334155;">Your one-time login code:</p>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #fbbf24; color: #0f172a; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('SMTP send failed:', e);
    return res.status(500).json({ error: `Could not send email: ${e.message}` });
  }

  res.setHeader('Set-Cookie', `auth_challenge=${challenge}; ${cookieFlags(600)}`);
  return res.status(200).json({ ok: true, message: `Code sent to ${email}` });
}
