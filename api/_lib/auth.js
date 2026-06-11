// Shared auth helpers used by all /api/auth/* endpoints and protected APIs.
// Files starting with _ are not deployed as routes by Vercel — only as helpers.

import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'PLEASE_SET_JWT_SECRET_ENV_VAR_AT_LEAST_32_CHARS_LONG'
);

const IS_PROD = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');

export async function signJWT(payload, expiresIn) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET);
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (e) {
    return null;
  }
}

export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOTP(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

export function getAllowedEmails() {
  const raw = process.env.ALLOWED_EMAILS || '';
  const allowed = raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  // Admin emails are implicitly allowed to log in, so you only have to list them
  // in ADMIN_EMAIL — no need to duplicate them in ALLOWED_EMAILS.
  const admins = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return Array.from(new Set([...allowed, ...admins]));
}

// ADMIN_EMAIL may now be a single email OR a comma-separated list, so multiple
// people can have admin rights (e.g. "me@x.com, partner@y.com").
export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAIL || '';
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

// Kept for backward compatibility: returns the FIRST admin email (used as the
// "send access requests to" address). Falls back to empty string if none set.
export function getAdminEmail() {
  return getAdminEmails()[0] || '';
}

export function parseCookie(req, name) {
  const cookies = (req.headers?.cookie || '').split(';');
  for (const c of cookies) {
    const trimmed = c.trim();
    if (trimmed.startsWith(name + '=')) return trimmed.slice(name.length + 1);
  }
  return null;
}

export function cookieFlags(maxAge) {
  const flags = ['HttpOnly', 'Path=/', `Max-Age=${maxAge}`, 'SameSite=Strict'];
  if (IS_PROD) flags.push('Secure');
  return flags.join('; ');
}

export async function getCurrentUser(req) {
  const token = parseCookie(req, 'session');
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (!payload || !payload.email) return null;
  return { email: payload.email, isAdmin: payload.isAdmin === true };
}

export async function requireAuth(req, res) {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return user;
}
