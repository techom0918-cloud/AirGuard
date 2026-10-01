import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Stethoscope,
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
import { medicationService, calculateBmi } from '../../services/medicationService';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated } = useAuth();

  // Step state (1: Credentials, 2: Biometrics)
  const [step, setStep] = useState<1 | 2>(1);

  // Account Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // AI Biometrics Form
  const [age, setAge] = useState<number>(25);
  const [massKg, setMassKg] = useState<number>(65);
  const [heightM, setHeightM] = useState<number>(1.70);
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [smokingStatus, setSmokingStatus] = useState<'Non-Smoker' | 'Ex-Smoker' | 'Current Smoker'>('Non-Smoker');
  const [asthmaLevel, setAsthmaLevel] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [peakFlow, setPeakFlow] = useState<number>(320);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must acknowledge the terms and non-diagnostic medical notice.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await register(fullName, email, password);
    if (res.success) {
      // Save AI Biometric Profile for Patient Dosage Inference
      const patient = medicationService.savePatient({
        name: fullName.trim(),
        age: Number(age),
        mass_kg: Number(massKg),
        height_m: Number(heightM),
        gender,
        smoking_status: smokingStatus,
        asthma_level: asthmaLevel,
        peak_flow: Number(peakFlow),
      });

      medicationService.setActivePatientId(patient.id);
      navigate('/app/dashboard', { replace: true });
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const bmiPreview = calculateBmi(massKg, heightM);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <PublicHeader />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0A6847] flex items-center justify-center mx-auto shadow-xs">
              {step === 1 ? <Shield className="w-6 h-6" /> : <Stethoscope className="w-6 h-6 text-[#2A8E77]" />}
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-['Space_Grotesk'] tracking-tight">
              {step === 1 ? 'Create AirGuard Account' : 'Patient Biometrics for AI Dosage'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {step === 1
                ? 'Step 1 of 2: Account Security Setup'
                : 'Step 2 of 2: Clinical parameters required for Random Forest AI model predictions'}
            </p>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className={`h-2 rounded-full transition-all ${step === 1 ? 'w-8 bg-[#2A8E77]' : 'w-2 bg-slate-200'}`} />
              <span className={`h-2 rounded-full transition-all ${step === 2 ? 'w-8 bg-[#2A8E77]' : 'w-2 bg-slate-200'}`} />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Account Credentials */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Siddharth Shukla"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20 focus:border-[#2A8E77]"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20 focus:border-[#2A8E77]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password (min 8 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20 focus:border-[#2A8E77]"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20 focus:border-[#2A8E77]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2A8E77] focus:ring-[#2A8E77] border-slate-300 mt-0.5"
                  />
                  <span>
                    I understand that AirGuard provides environmental risk observations, not medical diagnosis. I agree to the terms of service.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-[#2A8E77] hover:bg-[#1e6b5a] shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Continue to Clinical Biometrics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: AI Clinical Biometrics Setup */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#E8F4F0] rounded-2xl border border-[#2A8E77]/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2A8E77]">
                  <Activity className="w-4 h-4" /> Why do we need this data?
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Our Random Forest AI model uses your <strong>Age, BMI, Peak Flow, and Smoking Status</strong> combined with live backend ESP32 sensor values to calculate exact inhaler dosage recommendations in real time.
                </p>
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
                  <span>{isLoading ? 'Setting up Profile...' : 'Complete AI Registration'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Already registered? </span>
            <Link to="/login" className="font-bold text-[#2A8E77] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
