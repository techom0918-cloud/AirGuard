import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  User,
  Sparkles,
  Copy,
  Check,
  Activity,
  Cigarette,
  Heart,
  BarChart2,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { DEMO_PATIENT_EMAIL, DEMO_DOCTOR_EMAIL } from '../../services/authService';
import { medicationService, calculateBmi } from '../../services/medicationService';

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
  const { login, isLoading } = useAuth();

  // Step 1: Authentication Form | Step 2: Patient Biometrics Confirmation
  const [step, setStep] = useState<1 | 2>(1);

  const [activeTab, setActiveTab] = useState<RoleTab>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Patient Clinical Biometrics Form for Step 2
  const [patientName, setPatientName] = useState('Alex Sharma');
  const [age, setAge] = useState<number>(28);
  const [massKg, setMassKg] = useState<number>(65);
  const [heightM, setHeightM] = useState<number>(1.70);
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [smokingStatus, setSmokingStatus] = useState<'Non-Smoker' | 'Ex-Smoker' | 'Current Smoker'>('Non-Smoker');
  const [asthmaLevel, setAsthmaLevel] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [peakFlow, setPeakFlow] = useState<number>(320);

  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  // Step 1 validation
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (activeTab === 'doctor') {
      const res = await login(email, password, rememberSession);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Invalid doctor credentials.');
      }
      return;
    }

    // For Patient, pre-fill name from email or active patient
    const currentActive = medicationService.getActivePatient();
    if (currentActive) {
      setPatientName(currentActive.name);
      setAge(currentActive.age);
      setMassKg(currentActive.mass_kg);
      setHeightM(currentActive.height_m);
      setGender(currentActive.gender);
      setSmokingStatus(currentActive.smoking_status);
      setAsthmaLevel(currentActive.asthma_level || 'Moderate');
      setPeakFlow(currentActive.peak_flow);
    } else if (email === DEMO_PATIENT_EMAIL || email.toLowerCase().includes('alex')) {
      setPatientName('Alex Sharma');
    } else {
      const extracted = email.split('@')[0].replace(/[._]/g, ' ');
      setPatientName(extracted.charAt(0).toUpperCase() + extracted.slice(1));
    }

    // Proceed to Step 2: Patient Biometrics Confirmation
    setStep(2);
  };

  // Step 2: Finalize login & save patient profile
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await login(email, password, rememberSession);
    if (res.success) {
      // Save Patient Biometrics into medication service for AI predictions
      const patient = medicationService.savePatient({
        name: patientName.trim() || 'Patient',
        age: Number(age),
        mass_kg: Number(massKg),
        height_m: Number(heightM),
        gender,
        smoking_status: smokingStatus,
        asthma_level: asthmaLevel,
        peak_flow: Number(peakFlow),
      });

      medicationService.setActivePatientId(patient.id);
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.error || 'Failed to authenticate. Please verify credentials.');
      setStep(1);
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
  const bmiPreview = calculateBmi(massKg, heightM);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col font-sans">
      <PublicHeader />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2A8E77] to-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
                {step === 1 ? <Shield className="w-7 h-7" /> : <Stethoscope className="w-7 h-7" />}
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-['Space_Grotesk'] tracking-tight mt-2">
                {step === 1 ? 'Sign In to AirGuard' : 'Patient Biometrics for AI Dosage'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {step === 1
                  ? 'Access your personal environmental risk guardian'
                  : 'Confirm clinical parameters required by Random Forest AI model'}
              </p>

              {step === 2 && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs font-bold px-3 py-1 bg-[#E8F4F0] text-[#2A8E77] rounded-full">
                    Step 2 of 2: AI Input Configuration
                  </span>
                </div>
              )}
            </div>

            {/* STEP 1: LOGIN FORM */}
            {step === 1 && (
              <>
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
                <div
                  className={`rounded-2xl border p-4 space-y-3 ${
                    activeTab === 'doctor'
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          activeTab === 'doctor' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
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

                  <div className="space-y-1.5">
                    {[
                      { label: 'Email', value: demo.email, key: `${activeTab}-email` },
                      { label: 'Password', value: demo.password, key: `${activeTab}-pass` },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-1.5 border border-white/60"
                      >
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
                          {copiedField === item.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
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

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20 focus:border-[#2A8E77] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Password</label>
                      <Link to="/forgot-password" className="text-xs font-medium text-[#2A8E77] hover:underline">
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
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20 focus:border-[#2A8E77] bg-slate-50/50"
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberSession}
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="w-4 h-4 rounded text-[#2A8E77] focus:ring-[#2A8E77] border-slate-300"
                      />
                      <span>Remember session</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl font-bold text-white disabled:opacity-60 shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer ${
                      activeTab === 'doctor' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-[#2A8E77] hover:bg-[#1e6b5a]'
                    }`}
                  >
                    <span>
                      {isLoading
                        ? 'Authenticating...'
                        : activeTab === 'doctor'
                        ? 'Sign In as Doctor'
                        : 'Continue to Patient Biometrics'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>Don't have an AirGuard account? </span>
                  <Link to="/register" className="font-bold text-[#2A8E77] hover:underline">
                    Create Account
                  </Link>
                </div>
              </>
            )}

            {/* STEP 2: PATIENT BIOMETRICS FORM */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4 text-xs">
                <div className="p-3 bg-[#E8F4F0] rounded-2xl border border-[#2A8E77]/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2A8E77]">
                    <Activity className="w-4 h-4" /> Patient Biometric Details for AI Prediction
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Please confirm the patient's parameters below. The Random Forest model evaluates these values together with real-time ESP32 backend sensor data (PM2.5, AQI, Temp, Humidity) to determine the exact required dosage.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Age (yrs)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min={20}
                      max={250}
                      value={massKg}
                      onChange={(e) => setMassKg(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Height (m)</label>
                    <input
                      type="number"
                      step={0.01}
                      required
                      min={0.5}
                      max={2.5}
                      value={heightM}
                      onChange={(e) => setHeightM(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    />
                  </div>
                </div>

                {/* BMI Preview */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <BarChart2 className="w-3.5 h-3.5 text-[#2A8E77]" /> Calculated BMI:
                  </span>
                  <span className="font-extrabold text-[#2A8E77]">
                    {bmiPreview} {bmiPreview < 18.5 ? '(Underweight)' : bmiPreview < 25 ? '(Normal)' : bmiPreview < 30 ? '(Overweight)' : '(Obese)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Cigarette className="w-3.5 h-3.5 text-slate-500" /> Smoking Status
                    </label>
                    <select
                      value={smokingStatus}
                      onChange={(e) => setSmokingStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    >
                      <option value="Non-Smoker">Non-Smoker</option>
                      <option value="Ex-Smoker">Ex-Smoker</option>
                      <option value="Current Smoker">Current Smoker</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-500" /> Asthma Severity
                    </label>
                    <select
                      value={asthmaLevel}
                      onChange={(e) => setAsthmaLevel(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    >
                      <option value="Mild">Mild Asthma</option>
                      <option value="Moderate">Moderate Asthma</option>
                      <option value="Severe">Severe Asthma</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peak Flow (L/min)</label>
                    <input
                      type="number"
                      min={50}
                      max={800}
                      value={peakFlow}
                      onChange={(e) => setPeakFlow(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-[#2A8E77] hover:bg-[#1e6b5a] disabled:opacity-60 shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <span>{isLoading ? 'Authenticating & Saving...' : 'Confirm Biometrics & Enter Dashboard'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
