// Local development server — runs the same NSE proxy + auth as Vercel functions.
// Start with: npm run server
// Vite dev (npm run dev) proxies /api/* to this server on port 3001.

import express from 'express';
import { handler as nseHandler } from './api/nse-chain.js';
import { handler as dhanHandler } from './api/dhan-chain.js';
import authRequest from './api/auth/request.js';
import authRequestAccess from './api/auth/request-access.js';
import authVerify from './api/auth/verify.js';
import authMe from './api/auth/me.js';
import authLogout from './api/auth/logout.js';
import authUsers from './api/auth/users.js';

const app = express();
app.use(express.json());
const PORT = 3001;

// Wrap handlers — Vercel style (req.query, req.body) works with Express
app.get('/api/nse-chain', async (req, res) => { await nseHandler(req, res); });
app.get('/api/dhan-chain', async (req, res) => { await dhanHandler(req, res); });
app.post('/api/auth/request', async (req, res) => { await authRequest(req, res); });
app.post('/api/auth/request-access', async (req, res) => { await authRequestAccess(req, res); });
app.post('/api/auth/verify', async (req, res) => { await authVerify(req, res); });
app.get('/api/auth/me', async (req, res) => { await authMe(req, res); });
app.post('/api/auth/logout', async (req, res) => { await authLogout(req, res); });
app.get('/api/auth/users', async (req, res) => { await authUsers(req, res); });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n  ⚡ Dev API server running at http://localhost:${PORT}`);
  console.log(`  Auth endpoints: /api/auth/{request,verify,me,logout,users}`);
  console.log(`  Data endpoints: /api/{nse-chain,dhan-chain}\n`);
});

