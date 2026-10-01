import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Shield,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Save,
  Radio,
  Stethoscope,
  Activity,
  Cigarette,
  Heart,
  BarChart2,
} from 'lucide-react';
import { medicationService, PatientProfile, calculateBmi } from '../../services/medicationService';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Basic Account info
  const [name, setName] = useState(user?.name || 'Alex Sharma');
  const [email, setEmail] = useState(user?.email || 'patient@airguard.demo');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'Emergency Guardian');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relation || 'Guardian');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '+91 98765 43210');

  // Clinical Patient Biometrics (for AI model dosage prediction)
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [age, setAge] = useState<number>(28);
  const [massKg, setMassKg] = useState<number>(65);
  const [heightM, setHeightM] = useState<number>(1.70);
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [smokingStatus, setSmokingStatus] = useState<'Non-Smoker' | 'Ex-Smoker' | 'Current Smoker'>('Non-Smoker');
  const [asthmaLevel, setAsthmaLevel] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [peakFlow, setPeakFlow] = useState<number>(320);

  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load active patient biometrics from medicationService
  useEffect(() => {
    const active = medicationService.getActivePatient();
    if (active) {
      setActivePatientId(active.id);
      if (active.name) setName(active.name);
      setAge(active.age);
      setMassKg(active.mass_kg);
      setHeightM(active.height_m);
      setGender(active.gender);
      setSmokingStatus(active.smoking_status);
      setAsthmaLevel(active.asthma_level || 'Moderate');
      setPeakFlow(active.peak_flow);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // 1. Update auth profile
    await updateProfile({
      name,
      email,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
    });

    // 2. Update active patient biometrics for AI ML Model prediction
    const updatedPatient = medicationService.savePatient({
      id: activePatientId || undefined,
      name,
      age: Number(age),
      mass_kg: Number(massKg),
      height_m: Number(heightM),
      gender,
      smoking_status: smokingStatus,
      asthma_level: asthmaLevel,
      peak_flow: Number(peakFlow),
    });

    medicationService.setActivePatientId(updatedPatient.id);
    setActivePatientId(updatedPatient.id);

    setIsSaving(false);
    setSaveNotice('Profile and AI Clinical Biometrics saved successfully.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const bmiValue = calculateBmi(massKg, heightM);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#2A8E77]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            User Profile & Identity
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
          Manage your personal AirGuard account identifier, clinical biometrics for AI dosage predictions, and emergency contact.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2A8E77]" />
          <span className="font-semibold">{saveNotice}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          
          {/* Avatar and Basic Identifiers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-[#E8F4F0] text-[#2A8E77] flex items-center justify-center font-black text-2xl font-['Space_Grotesk'] shadow-inner shrink-0">
              {name.split(' ').map((n) => n[0]).join('') || 'AG'}
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <span>{name || 'AirGuard Member'}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E8F4F0] text-[#2A8E77] font-semibold">
                  Active Patient
                </span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{email}</span>
              </p>
              <p className="text-xs text-[#2A8E77] flex items-center gap-2 font-medium">
                <Radio className="w-3.5 h-3.5" />
                <span>Linked Hardware Device: {user?.deviceAssignedId || 'ESP32-AG-001'}</span>
              </p>
            </div>
          </div>

          {/* SECTION 1: Account Identifiers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
              <User className="w-4 h-4 text-[#2A8E77]" /> Personal Account Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: AI Clinical Biometrics (Filled during login/register) */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#2A8E77]" /> Clinical AI Biometrics & Parameters
              </h4>
              <span className="text-[10px] bg-[#E8F4F0] text-[#2A8E77] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Activity className="w-3 h-3" /> Used by ML Model
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              These clinical parameters were entered during login/registration and are fed into the <strong>Random Forest AI Classifier</strong> alongside real-time ESP32 backend sensor data (PM2.5, AQI, Temp, Humidity) to predict exact inhaler dosage recommendations.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#E8F4F0]/50 p-4 rounded-2xl border border-[#2A8E77]/20 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age (years)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
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
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
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
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calculated BMI</label>
                <div className="p-2 rounded-xl bg-white border border-slate-200 font-extrabold text-[#2A8E77]">
                  {bmiValue} <span className="text-[10px] font-normal text-slate-500">
                    {bmiValue < 18.5 ? '(Underweight)' : bmiValue < 25 ? '(Normal)' : bmiValue < 30 ? '(Overweight)' : '(Obese)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> Asthma Level
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
          </div>

          {/* SECTION 3: Emergency / Caregiver Contact Details */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
              Guardian / Emergency Contact
            </h4>
            <p className="text-xs text-slate-500">
              This contact receives high-priority ambient warning SMS notifications if sustained severe particulate spikes coincide with acute inhaler actuations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telephone Number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/20"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl font-bold text-white bg-[#2A8E77] hover:bg-[#1e6b5a] shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
