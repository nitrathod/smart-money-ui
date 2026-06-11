// POST /api/auth/verify
// Body: { otp }
// Cookie: auth_challenge (set by /api/auth/request)
// Verifies the OTP, clears the challenge, sets a 30-day session cookie.

import { verifyJWT, hashOTP, signJWT, getAdminEmail, isAdminEmail, parseCookie, cookieFlags } from '../_lib/auth.js';

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

  const otp = (body?.otp || '').toString().trim();
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be 6 digits' });
  }

  const challenge = parseCookie(req, 'auth_challenge');
  if (!challenge) {
    return res.status(400).json({ error: 'No active challenge. Request a new code.' });
  }

  const payload = await verifyJWT(challenge);
  if (!payload || payload.purpose !== 'otp') {
    return res.status(400).json({ error: 'Challenge expired or invalid. Request a new code.' });
  }

  const submittedHash = hashOTP(otp);
  if (submittedHash !== payload.otpHash) {
    return res.status(400).json({ error: 'Invalid code. Try again.' });
  }

  const email = payload.email;
  const isAdmin = isAdminEmail(email);
  const session = await signJWT({ email, isAdmin, purpose: 'session' }, '30d');

  res.setHeader('Set-Cookie', [
    `auth_challenge=; ${cookieFlags(0)}`,
    `session=${session}; ${cookieFlags(60 * 60 * 24 * 30)}`,
  ]);

  return res.status(200).json({ ok: true, email, isAdmin });
}
