import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight, Loader2, ShieldCheck, UserPlus, CheckCircle2, MessageCircle } from 'lucide-react';
import { Logo } from './Logo.jsx';

export default function Login({ onAuthenticated }) {
  const [mode, setMode] = useState('signin'); // signin | request
  const [stage, setStage] = useState('email'); // email | otp (signin); form | submitted (request)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Request-access form state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqWhatsapp, setReqWhatsapp] = useState('');
  const [reqPurpose, setReqPurpose] = useState('');
  const [reqAck, setReqAck] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setStage(newMode === 'signin' ? 'email' : 'form');
    setError('');
    setInfo('');
  };

  const requestOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code');
      setInfo(data.message || 'Code sent. Check your inbox.');
      setStage('otp');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      onAuthenticated(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAccessRequest = async (e) => {
    e?.preventDefault();
    setError('');
    if (!reqAck) {
      setError('Please acknowledge that this is an educational tool.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reqName.trim(),
          email: reqEmail.trim().toLowerCase(),
          whatsapp: reqWhatsapp.trim(),
          purpose: reqPurpose.trim(),
          acknowledged: reqAck,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit request');
      if (data.alreadyAuthorized) {
        // Pivot back to sign-in flow
        setEmail(reqEmail.trim().toLowerCase());
        switchMode('signin');
        setInfo(data.message);
        return;
      }
      setStage('submitted');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStage('email');
    setOtp('');
    setError('');
    setInfo('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 terminal-bg">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <Logo size={56} className="inline-block mb-5" />
          <h1 className="text-3xl font-semibold tracking-wider uppercase text-slate-900">Smart Money</h1>
          <p className="text-xs text-slate-500 mt-3 font-mono tracking-wide">
            NIFTY option chain · 9:20 · 11:00 · 1:00 · 3:00
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono mb-5">
            <ShieldCheck className="w-4 h-4" />
            <span>INVITE-ONLY · EDUCATIONAL TOOL</span>
          </div>

          {/* ===== SIGN IN ===== */}
          {mode === 'signin' && stage === 'email' && (
            <form onSubmit={requestOtp}>
              <h2 className="text-xl font-semibold text-slate-900 mb-1 font-serif">Sign in</h2>
              <p className="text-sm text-slate-600 mb-5">Enter your authorized email to receive a one-time code.</p>

              <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Email Address</label>
              <div className="relative mb-4">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-slate-300 rounded-md pl-10 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-600"
                />
              </div>

              {info && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-xs text-emerald-700 mb-3">
                  {info}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-xs text-red-700 mb-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-md py-2.5 flex items-center justify-center gap-2 transition mb-3"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Sending code...' : 'Send login code'}
              </button>

              <div className="text-center pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Don't have access yet?</p>
                <button
                  type="button"
                  onClick={() => switchMode('request')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Request access
                </button>
              </div>
            </form>
          )}

          {mode === 'signin' && stage === 'otp' && (
            <form onSubmit={verifyOtp}>
              <h2 className="text-xl font-semibold text-slate-900 mb-1 font-serif">Enter code</h2>
              <p className="text-sm text-slate-600 mb-5">
                We sent a 6-digit code to <span className="text-amber-600 font-mono">{email}</span>. It expires in 10 minutes.
              </p>

              <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">6-Digit Code</label>
              <div className="relative mb-4">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-white border border-slate-300 rounded-md pl-10 pr-3 py-2.5 text-lg font-mono tracking-[0.5em] text-amber-700 focus:outline-none focus:border-amber-600"
                />
              </div>

              {info && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-xs text-emerald-700 mb-3">
                  {info}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-xs text-red-700 mb-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-md py-2.5 flex items-center justify-center gap-2 transition mb-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loading ? 'Verifying...' : 'Verify & sign in'}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-xs text-slate-500 hover:text-slate-900 py-2"
              >
                ← Use a different email
              </button>
            </form>
          )}

          {/* ===== REQUEST ACCESS ===== */}
          {mode === 'request' && stage === 'form' && (
            <form onSubmit={submitAccessRequest}>
              <h2 className="text-xl font-semibold text-slate-900 mb-1 font-serif">Request access</h2>
              <p className="text-sm text-slate-600 mb-5">
                This is an invite-only educational tool. Tell us a bit about you — we'll reach out within 24 hours.
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={reqName}
                    onChange={e => setReqName(e.target.value)}
                    placeholder="Rakesh Sharma"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={reqEmail}
                    onChange={e => setReqEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={reqWhatsapp}
                    onChange={e => setReqWhatsapp(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">
                    Why are you interested? <span className="text-slate-500 normal-case">(brief)</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reqPurpose}
                    onChange={e => setReqPurpose(e.target.value)}
                    placeholder="I trade NIFTY options 2-3x a week and want a structured way to read smart money positioning..."
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-amber-600 resize-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-3 text-xs text-amber-900 mb-3 cursor-pointer hover:bg-amber-50 transition">
                <input
                  type="checkbox"
                  checked={reqAck}
                  onChange={e => setReqAck(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-500 flex-shrink-0"
                />
                <span className="leading-relaxed">
                  I understand this is an <strong>educational analysis tool</strong> based on publicly available option chain data — <strong>not investment advice or a SEBI-registered service</strong>. I am responsible for my own trading decisions and any losses incurred. Any monthly contribution discussed is for tool access only, not for advisory services.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-xs text-red-700 mb-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !reqAck}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-md py-2.5 flex items-center justify-center gap-2 transition mb-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit request'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="w-full text-xs text-slate-500 hover:text-slate-900 py-2"
              >
                ← I already have access
              </button>
            </form>
          )}

          {mode === 'request' && stage === 'submitted' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 font-serif">Request received</h2>
              <p className="text-sm text-slate-600 mb-1">
                Thanks <span className="text-amber-600">{reqName.split(' ')[0]}</span> — we'll be in touch within 24 hours.
              </p>
              <p className="text-xs text-slate-500 mb-5">
                Check your email for confirmation. Reach out on WhatsApp at <strong className="text-slate-700">{reqWhatsapp}</strong>.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4 text-left">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                  <div>
                    Once approved, you'll receive sign-in instructions and details about the small monthly contribution for the trial.
                  </div>
                </div>
              </div>

              <button
                onClick={() => switchMode('signin')}
                className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
              >
                ← Back to sign-in
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          Educational analysis tool. Not investment advice.
        </p>
      </div>
    </div>
  );
}

