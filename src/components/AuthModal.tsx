import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  KeyRound, 
  UserPlus, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState('analyst@sentrabank.com');
  const [password, setPassword] = useState('admin123');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Junior Fraud Analyst');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your banking credentials and password.');
      return;
    }

    if (password.length < 5) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // Role mapping for known demo accounts
    let name = 'Lead Analyst Sarah Connor';
    let role = 'Senior Fraud Analyst';

    if (email.includes('manager')) {
      name = 'Marcus Vance (Risk VP)';
      role = 'Risk Operations Manager';
    } else if (email.includes('audit')) {
      name = 'Elena Rostova (Compliance)';
      role = 'Compliance Officer';
    } else if (email !== 'analyst@sentrabank.com') {
      name = email.split('@')[0].toUpperCase();
      role = 'Authorized Fraud Analyst';
    }

    onLoginSuccess({ name, role, email });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName || !regEmail || !regPassword) {
      setError('Please fill all required registration fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Security policy requires at least 6 characters for master password.');
      return;
    }

    setSuccessMsg(`Account registered successfully for ${regName}! You can now authenticate.`);
    setEmail(regEmail);
    setPassword(regPassword);
    setIsRegister(false);
  };

  const handleQuickDemo = (roleType: 'analyst' | 'manager' | 'compliance') => {
    if (roleType === 'analyst') {
      setEmail('analyst@sentrabank.com');
      setPassword('admin123');
      onLoginSuccess({
        name: 'Sarah Connor',
        role: 'Senior Fraud Analyst',
        email: 'analyst@sentrabank.com'
      });
    } else if (roleType === 'manager') {
      setEmail('manager@sentrabank.com');
      setPassword('manager123');
      onLoginSuccess({
        name: 'Marcus Vance',
        role: 'Risk Operations Manager',
        email: 'manager@sentrabank.com'
      });
    } else {
      setEmail('auditor@sentrabank.com');
      setPassword('audit123');
      onLoginSuccess({
        name: 'Elena Rostova',
        role: 'Compliance Officer',
        email: 'auditor@sentrabank.com'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-600"></div>

        <div className="p-6 sm:p-8">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-900/40 border border-blue-400/30">
              <ShieldAlert className="w-7 h-7 text-amber-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">SentraBank</h2>
            <p className="text-xs text-slate-400 mt-0.5">AI-Based Banking Fraud Surveillance Console</p>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isRegister ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email or Analyst ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@sentrabank.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-slate-100 placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Security Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-slate-100 placeholder-slate-600 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400">Remember this workstation</span>
                </label>
                <span className="text-[11px] text-slate-500">256-Bit SSL Encrypted</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                Authenticate & Enter System
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rachel.adams@sentrabank.com"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Department</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100"
                >
                  <option value="Junior Fraud Analyst">Junior Fraud Analyst</option>
                  <option value="Senior Fraud Analyst">Senior Fraud Analyst</option>
                  <option value="Risk Operations Manager">Risk Operations Manager</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg shadow transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Register Analyst Credentials
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Buttons (Internship Evaluation Convenience) */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> One-Click Quick Login (Demo):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('analyst')}
                className="px-2 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 font-medium border border-slate-700/60 transition text-center"
              >
                Lead Analyst
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="px-2 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 font-medium border border-slate-700/60 transition text-center"
              >
                Risk VP
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('compliance')}
                className="px-2 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 font-medium border border-slate-700/60 transition text-center"
              >
                Auditor
              </button>
            </div>
          </div>

          {/* Toggle Login / Register */}
          <div className="mt-4 text-center">
            {isRegister ? (
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Already have security clearance? <span className="text-blue-400 font-semibold">Sign In</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Need analyst access? <span className="text-amber-400 font-semibold">Register New Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Reset Security Password
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              In banking compliance environments, credentials require SOC approval or Active Directory synchronization.
            </p>
            <div className="mb-4">
              <label className="text-xs text-slate-300 block mb-1">Corporate Email</label>
              <input
                type="email"
                defaultValue="analyst@sentrabank.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Password reset ticket #8942 has been dispatched to the Banking Security Operations Center.');
                  setShowForgotModal(false);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition"
              >
                Dispatch Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
