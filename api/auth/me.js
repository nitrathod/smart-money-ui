// GET /api/auth/me
// Returns the current user if the session cookie is valid.

import { getCurrentUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  const user = await getCurrentUser(req);
  if (!user) return res.status(200).json({ authenticated: false });
  return res.status(200).json({ authenticated: true, ...user });
}
