// POST /api/auth/request-access
// Body: { name, email, whatsapp, purpose }
// Emails the admin with the request, and sends a confirmation to the applicant.

import nodemailer from 'nodemailer';
import { getAdminEmail, getAllowedEmails } from '../_lib/auth.js';

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

// Very basic rate-limit so the form isn't a spam vector.
// Per-instance only — good enough for low traffic.
const recentRequests = new Map();
const RATE_LIMIT_MS = 60 * 1000; // 1 request per email per minute

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try { body = await readBody(req); }
  catch (e) { return res.status(400).json({ error: 'Invalid JSON body' }); }

  const name        = (body?.name        || '').toString().trim();
  const email       = (body?.email       || '').toString().trim().toLowerCase();
  const whatsapp    = (body?.whatsapp    || '').toString().trim();
  const purpose     = (body?.purpose     || '').toString().trim();
  const acknowledged = body?.acknowledged === true;

  if (!name || name.length < 2)       return res.status(400).json({ error: 'Name required' });
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
  if (!whatsapp || whatsapp.length < 8) return res.status(400).json({ error: 'Valid WhatsApp number required' });
  if (!purpose || purpose.length < 10)  return res.status(400).json({ error: 'Tell us briefly why (min 10 chars)' });
  if (!acknowledged) return res.status(400).json({ error: 'You must acknowledge the educational-only disclaimer.' });

  // If already authorized, redirect to sign-in
  const allowed = getAllowedEmails();
  if (allowed.includes(email)) {
    return res.status(200).json({ ok: true, alreadyAuthorized: true, message: 'You already have access — sign in instead.' });
  }

  // Rate limit
  const lastReq = recentRequests.get(email);
  if (lastReq && Date.now() - lastReq < RATE_LIMIT_MS) {
    return res.status(429).json({ error: 'Please wait a minute before requesting again.' });
  }
  recentRequests.set(email, Date.now());

  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return res.status(500).json({ error: 'Admin email not configured.' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({ error: 'SMTP not configured.' });
  }

  const requestedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: smtpUser, pass: smtpPass },
    });

    // 1. Email to admin (you)
    const adminMail = {
      from: process.env.SMTP_FROM || smtpUser,
      to: adminEmail,
      replyTo: email,
      subject: `🔔 New access request — ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 24px auto; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin: 0 0 16px;">New access request</h2>
          <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <p style="margin: 0 0 8px;"><strong>WhatsApp:</strong> <a href="https://wa.me/${escapeHtml(whatsapp.replace(/\D/g, ''))}">${escapeHtml(whatsapp)}</a></p>
            <p style="margin: 8px 0 0;"><strong>Reason for access:</strong></p>
            <p style="margin: 4px 0 0; background: #f1f5f9; padding: 12px; border-radius: 6px; white-space: pre-wrap;">${escapeHtml(purpose)}</p>
            <p style="margin: 12px 0 0; font-size: 12px; color: #059669;">✓ Acknowledged educational-only disclaimer at submission</p>
          </div>
          <p style="color: #64748b; font-size: 12px;">Requested at ${requestedAt} IST · IP ${escapeHtml(String(ip))}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #334155; font-size: 14px; margin: 0 0 8px;"><strong>To approve:</strong></p>
          <ol style="color: #334155; font-size: 13px; padding-left: 20px;">
            <li>Reach out via WhatsApp/email, work out trial terms</li>
            <li>Once paid: add <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${escapeHtml(email)}</code> to <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">ALLOWED_EMAILS</code> env var on Vercel</li>
            <li>Redeploy with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">npx vercel --prod</code></li>
          </ol>
        </div>
      `,
    };

    // 2. Confirmation email to applicant
    const userMail = {
      from: process.env.SMTP_FROM || smtpUser,
      to: email,
      replyTo: adminEmail,
      subject: 'Access request received — NIFTY Smart Money Tracker',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <h2 style="color: #0f172a; margin: 0 0 16px;">Got your request, ${escapeHtml(name.split(' ')[0])}.</h2>
          <p style="color: #334155;">Thanks for your interest in NIFTY Smart Money Tracker.</p>
          <p style="color: #334155;">This is an invite-only educational tool. I review every request personally. You'll hear back within <strong>24 hours</strong> on WhatsApp at <strong>${escapeHtml(whatsapp)}</strong> or by reply to this email.</p>
          <p style="color: #334155;">If approved, you'll be sent details on a small monthly contribution for the trial and how to get set up.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            <strong>Disclaimer:</strong> This tool provides educational analysis of publicly available option chain data. It is not investment advice. All trading decisions are your own. Options carry uncapped risk on short positions.
          </p>
        </div>
      `,
    };

    // Send both. Admin email is the must-succeed; applicant email is best-effort.
    await transporter.sendMail(adminMail);
    transporter.sendMail(userMail).catch(e => console.warn('Confirmation to applicant failed:', e.message));

  } catch (e) {
    console.error('Access request send failed:', e);
    return res.status(500).json({ error: `Could not submit request: ${e.message}` });
  }

  return res.status(200).json({ ok: true, message: 'Request received. You will hear back within 24 hours.' });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
