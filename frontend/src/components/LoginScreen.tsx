import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Aurora from './Aurora';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('auditor_admin');
  const [password, setPassword] = useState('audit2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify offline credentials.');
    }
  };

  const handleQuickFill = () => {
    setUsername('auditor_admin');
    setPassword('audit2026');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B1F3A] overflow-hidden p-4">
      {/* Full-screen background Aurora shader */}
      <Aurora
        colorStops={['#0B1F3A', '#1A365D', '#0B1F3A']}
        amplitude={0.35}
        blend={0.65}
      />

      {/* Login Panel — Engineered Technical Register Style */}
      <div className="relative z-10 w-full max-w-md bg-[#FFFFFF] border-2 border-[#0B1F3A] rounded-[2px] p-8 text-left shadow-2xl space-y-5">
        {/* Top Identification Stripe & Status */}
        <div className="flex items-center justify-between border-b border-[#5C6670]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#138808] inline-block animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B1F3A] font-bold">
              ENCLAVE: SECURE &bull; LOCAL
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#5C6670] uppercase">
            v1.0.0-PROD
          </span>
        </div>

        {/* Editorial Serif Header Anchor */}
        <div>
          <div className="text-[11px] font-mono text-[#5C6670] uppercase tracking-wider">
            GOVERNMENT OF INDIA &bull; EXAMINATION INTEGRITY
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A] font-serif tracking-tight mt-1">
            Terra Trace <span className="font-serif italic font-normal text-[#5C6670]">Register</span>
          </h1>
          <p className="text-xs text-[#5C6670] font-sans mt-1 leading-relaxed">
            Forensic Decision-Support Platform for Exam Integrity & Statistical Triage
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#8A1538] text-white text-xs rounded-[2px] font-sans flex items-start gap-2">
            <span className="font-bold font-mono">[ERROR]</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#1A1A1A] font-bold">
                01 // Auditor Identifier
              </label>
              <span className="text-[10px] font-mono text-[#5C6670]">Badge / Username</span>
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] focus:bg-[#FFFFFF]"
              placeholder="e.g. auditor_admin"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#1A1A1A] font-bold">
                02 // Secure Passphrase
              </label>
              <span className="text-[10px] font-mono text-[#5C6670]">Local Authentication</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] focus:bg-[#FFFFFF]"
              placeholder="••••••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[10px] font-mono text-[#0B1F3A] hover:underline cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>[+] Auto-fill Default Credential</span>
            </button>
            <span className="text-[10px] font-mono text-[#5C6670]">
              AIR-GAPPED
            </span>
          </div>

          {/* Primary Navy Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#0B1F3A] text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-[2px] border border-[#0B1F3A] hover:bg-[#0B1F3A]/90 cursor-pointer disabled:opacity-50 transition-none"
          >
            {isLoading ? 'Verifying Enclave Identity...' : 'Sign In to Investigation Register'}
          </button>
        </form>

        {/* System Enclave Atmosphere Footnote */}
        <div className="pt-3 border-t border-[#5C6670]/30 space-y-1.5 text-[10px] font-mono text-[#5C6670]">
          <div className="flex items-center justify-between">
            <span>// ARCHITECTURE: AIR-GAPPED / POLARS ENGINE</span>
            <span>NO TELEMETRY</span>
          </div>
          <div className="text-[10px] font-sans leading-tight text-[#5C6670]">
            All forensic evidence and human case decisions are permanently committed to an immutable SQLite append-only audit trail.
          </div>
        </div>
      </div>
    </div>
  );
};
