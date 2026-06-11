// POST /api/auth/logout
// Clears the session cookie.

import { cookieFlags } from '../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', `session=; ${cookieFlags(0)}`);
  return res.status(200).json({ ok: true });
}
