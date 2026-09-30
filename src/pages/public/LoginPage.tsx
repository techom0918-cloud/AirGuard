import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  User,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { DEMO_PATIENT_EMAIL, DEMO_DOCTOR_EMAIL } from '../../services/authService';

// Demo credential sets
const DEMO_CREDENTIALS = {
  patient: {
    email: DEMO_PATIENT_EMAIL,
    password: 'Patient@123',
    name: 'Alex Sharma',
    label: 'Patient Demo',
    description: 'View dashboards, map, event history and environmental readings.',
    icon: <User className="w-4 h-4" />,
    accent: 'emerald',
  },
  doctor: {
    email: DEMO_DOCTOR_EMAIL,
    password: 'Doctor@123',
    name: 'Dr. Priya Mehta',
    label: 'Doctor Demo',
    description: 'All patient features + ability to resolve alerts and access clinical controls.',
    icon: <Stethoscope className="w-4 h-4" />,
    accent: 'blue',
  },
} as const;

type RoleTab = 'patient' | 'doctor';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<RoleTab>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    const res = await login(email, password, rememberSession);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.error || 'Invalid credentials.');
    }
  };

  const fillDemo = (role: RoleTab) => {
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
    setErrorMessage(null);
    setActiveTab(role);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {}
  };

  const demo = DEMO_CREDENTIALS[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col font-sans">
      <PublicHeader />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-4">

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-8 space-y-6">

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center mx-auto shadow-md w-14 h-14">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-['Space_Grotesk'] tracking-tight mt-2">
                Sign In to AirGuard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Access your personal environmental risk guardian
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="bg-slate-100 rounded-2xl p-1 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('patient')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'patient'
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-4 h-4" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('doctor')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'doctor'
                    ? 'bg-white text-blue-800 shadow-sm border border-blue-200/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Doctor
              </button>
            </div>

            {/* Demo Credential Card */}
            <div className={`rounded-2xl border p-4 space-y-3 ${
              activeTab === 'doctor'
                ? 'bg-blue-50/60 border-blue-200'
                : 'bg-emerald-50/60 border-emerald-200'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'doctor' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {demo.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${activeTab === 'doctor' ? 'text-blue-900' : 'text-emerald-900'}`}>
                      {demo.label} Account
                    </p>
                    <p className={`text-[11px] ${activeTab === 'doctor' ? 'text-blue-700' : 'text-emerald-700'}`}>
                      {demo.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fillDemo(activeTab)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    activeTab === 'doctor'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-fill
                </button>
              </div>

              <p className={`text-[11px] leading-relaxed ${activeTab === 'doctor' ? 'text-blue-800' : 'text-emerald-800'}`}>
                {demo.description}
              </p>

              {/* Credentials display */}
              <div className="space-y-1.5">
                {[
                  { label: 'Email', value: demo.email, key: `${activeTab}-email` },
                  { label: 'Password', value: demo.password, key: `${activeTab}-pass` },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-1.5 border border-white/60">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">{item.label}</span>
                      <span className="text-[11px] font-mono font-bold text-slate-800">{item.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.value, item.key)}
                      className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                      title={`Copy ${item.label}`}
                    >
                      {copiedField === item.key
                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                        : <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#0A6847] hover:text-[#085338]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0A6847] focus:ring-[#0A6847] border-slate-300"
                  />
                  <span>Remember session</span>
                </label>
                {activeTab === 'doctor' && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Stethoscope className="w-2.5 h-2.5" /> Doctor Access
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-white disabled:opacity-60 shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === 'doctor'
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : 'bg-[#0A6847] hover:bg-[#085338]'
                }`}
              >
                <span>{isLoading ? 'Authenticating...' : `Sign In as ${activeTab === 'doctor' ? 'Doctor' : 'Patient'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Social Auth */}
            <div className="pt-1 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
                  Or Federated Sign-In
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  login('google-user@airguard.health', 'oauth_token', rememberSession).then(() => {
                    navigate(from, { replace: true });
                  });
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google (Firebase-Ready)</span>
              </button>
            </div>

            <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Don't have an AirGuard account? </span>
              <Link to="/register" className="font-bold text-[#0A6847] hover:underline">
                Create Account
              </Link>
            </div>
          </div>

          {/* Quick switch hint */}
          <p className="text-center text-[11px] text-slate-400 pb-2">
            Switch the tab above to log in as a <strong className="text-emerald-700">Patient</strong> or <strong className="text-blue-700">Doctor</strong>
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
