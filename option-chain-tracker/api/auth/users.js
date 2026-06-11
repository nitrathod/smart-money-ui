// GET /api/auth/users
// Admin-only. Returns the current allowlist and admin email.

import { requireAuth, getAllowedEmails, getAdminEmail } from '../_lib/auth.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  return res.status(200).json({
    admin: getAdminEmail(),
    allowed: getAllowedEmails(),
    note: 'To add or remove emails, update the ALLOWED_EMAILS environment variable in your Vercel project settings and redeploy.',
  });
}
