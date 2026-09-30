import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pill,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  User,
  Plus,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  Users,
  Cigarette,
  Heart,
  BarChart2,
  RefreshCw,
  AlertCircle,
  Info,
} from 'lucide-react';
import { environmentService } from '../../services/environmentService';
import {
  medicationService,
  MedicationPredictionResult,
  PatientProfile,
  calculateBmi,
  SensorInput,
} from '../../services/medicationService';
import { EnvironmentSnapshot } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';

const riskBadgeVariant = (level: 'SAFE' | 'WARNING' | 'DANGER'): 'green' | 'amber' | 'red' => {
  if (level === 'SAFE') return 'green';
  return 'red';
};

const DOSAGE_EMOJI: Record<string, string> = {
  '50 µL': '🟢',
  '100 µL': '🔴',
  '150 µL': '🔴',
};

export const MedicationPage: React.FC = () => {
  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot | null>(null);

  // Patient Management
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [activePatient, setActivePatient] = useState<PatientProfile | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState<boolean>(false);

  // Patient Form
  const [formName, setFormName] = useState<string>('');
  const [formAge, setFormAge] = useState<number>(30);
  const [formMassKg, setFormMassKg] = useState<number>(65);
  const [formHeightM, setFormHeightM] = useState<number>(1.70);
  const [formGender, setFormGender] = useState<PatientProfile['gender']>('Female');
  const [formSmokingStatus, setFormSmokingStatus] = useState<PatientProfile['smoking_status']>('Non-Smoker');
  const [formAsthmaLevel, setFormAsthmaLevel] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [formPeakFlow, setFormPeakFlow] = useState<number>(300);

  // ── KEY FIX: sensor inputs are stored separately so sliders drive dosage ──
  const [sensorInput, setSensorInput] = useState<SensorInput>({
    pm25: 18, aqi: 42, humidity: 50, temp_c: 24,
  });

  // Live Dosage Prediction
  const [prediction, setPrediction] = useState<MedicationPredictionResult | null>(null);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>('custom');

  // ── Load patients & subscribe to environment once ──
  useEffect(() => {
    const loadedPatients = medicationService.getPatients();
    setPatients(loadedPatients);
    const active = medicationService.getActivePatient();
    setActivePatient(active);

    // Subscribe to live environmental sensor feed
    const unsub = environmentService.subscribeToSnapshot((snap) => {
      setSnapshot(snap);
      // Only auto-sync sliders if user explicitly chose 'live' mode
      if (activeScenarioRef.current === 'live') {
        const livePm25 = Math.max(5, snap.pm25.value);
        const liveAqi = Math.max(5, snap.riskScore);
        const liveHum = Math.max(15, snap.humidity.value);
        const liveTemp = snap.temperature.value;
        setSensorInput({ pm25: livePm25, aqi: liveAqi, humidity: liveHum, temp_c: liveTemp });
      }
    });

    // Only get snapshot for display — do NOT override slider defaults
    environmentService.getLatestSnapshot().then((snap) => {
      setSnapshot(snap);
      // Sliders keep their realistic defaults unless user taps Live mode
    });

    return () => unsub();
  }, []);

  // Track activeScenario in a ref so the subscription closure can access it
  const activeScenarioRef = useRef('custom');
  useEffect(() => { activeScenarioRef.current = activeScenario; }, [activeScenario]);

  // ── KEY FIX: Recompute dosage whenever sensorInput OR activePatient changes ──
  useEffect(() => {
    if (!activePatient) return;

    setIsComputing(true);
    let cancelled = false;

    medicationService
      .predict(sensorInput, {
        age: activePatient.age,
        mass_kg: activePatient.mass_kg,
        height_m: activePatient.height_m,
        gender: activePatient.gender,
        smoking_status: activePatient.smoking_status,
        peak_flow: activePatient.peak_flow,
        asthma_level: activePatient.asthma_level,
      })
      .then((res) => {
        if (!cancelled) {
          setPrediction(res);
          setIsComputing(false);
        }
      });

    return () => { cancelled = true; };
  }, [sensorInput, activePatient]);

  // ── Scenario Presets ──
  const applyPreset = (name: string, pm25: number, aqi: number, temp: number, humidity: number) => {
    setActiveScenario(name);
    const si: SensorInput = { pm25, aqi, humidity, temp_c: temp };
    setSensorInput(si);
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (pm25 > 75 || aqi > 150) riskLevel = 'high';
    else if (pm25 > 35 || aqi > 70) riskLevel = 'moderate';
    environmentService.updateCustomSnapshot({
      pm25: { value: pm25, unit: 'µg/m³', status: riskLevel === 'high' ? 'critical' : riskLevel === 'moderate' ? 'warning' : 'good' },
      riskScore: aqi,
      riskLevel,
      temperature: { value: temp, unit: '°C', status: 'good' },
      humidity: { value: humidity, unit: '%', status: 'good' },
    });
  };

  const updateSlider = (field: keyof SensorInput, val: number) => {
    setActiveScenario('custom');
    const updated = { ...sensorInput, [field]: val };
    setSensorInput(updated);
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (updated.pm25 > 75 || updated.aqi > 150) riskLevel = 'high';
    else if (updated.pm25 > 35 || updated.aqi > 70) riskLevel = 'moderate';
    environmentService.updateCustomSnapshot({
      pm25: { value: updated.pm25, unit: 'µg/m³', status: riskLevel === 'high' ? 'critical' : riskLevel === 'moderate' ? 'warning' : 'good' },
      riskScore: updated.aqi,
      riskLevel,
      temperature: { value: updated.temp_c, unit: '°C', status: 'good' },
      humidity: { value: updated.humidity, unit: '%', status: 'good' },
    });
  };

  const handleSelectPatient = (patient: PatientProfile) => {
    medicationService.setActivePatientId(patient.id);
    setActivePatient({ ...patient }); // force state update
    setIsAddingPatient(false);
  };

  const handleOpenAddPatient = () => {
    setFormName('');
    setFormAge(28);
    setFormMassKg(62);
    setFormHeightM(1.68);
    setFormGender('Female');
    setFormSmokingStatus('Non-Smoker');
    setFormAsthmaLevel('Moderate');
    setFormPeakFlow(320);
    setIsAddingPatient(true);
  };

  const handleOpenEditPatient = () => {
    if (!activePatient) return;
    setFormName(activePatient.name);
    setFormAge(activePatient.age);
    setFormMassKg(activePatient.mass_kg);
    setFormHeightM(activePatient.height_m);
    setFormGender(activePatient.gender);
    setFormSmokingStatus(activePatient.smoking_status);
    setFormAsthmaLevel(activePatient.asthma_level || 'Moderate');
    setFormPeakFlow(activePatient.peak_flow);
    setIsAddingPatient(true);
  };

  const handleSavePatientForm = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = medicationService.savePatient({
      id: activePatient && formName === activePatient.name ? activePatient.id : undefined,
      name: formName.trim() || `Patient #${patients.length + 1}`,
      age: Number(formAge),
      mass_kg: Number(formMassKg),
      height_m: Number(formHeightM),
      gender: formGender,
      smoking_status: formSmokingStatus,
      asthma_level: formAsthmaLevel,
      peak_flow: Number(formPeakFlow),
    });
    const updated = medicationService.getPatients();
    setPatients(updated);
    setActivePatient({ ...saved }); // trigger dosage recompute
    setIsAddingPatient(false);
  };

  const handleDeletePatient = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    medicationService.deletePatient(id);
    const updated = medicationService.getPatients();
    setPatients(updated);
    if (updated.length > 0) {
      setActivePatient({ ...updated[0] });
    } else {
      setActivePatient(null);
      setPrediction(null);
    }
  };

  if (!snapshot) return <LoadingState message="Loading live metrics..." />;

  const bmiPreview = calculateBmi(formMassKg, formHeightM);
  const dosageEmoji = prediction ? (DOSAGE_EMOJI[prediction.dosage_amount] ?? '🟡') : '⏳';

  // Risk color for dosage card
  const dosageCardBg =
    prediction?.environmental_risk === 'DANGER'
      ? 'bg-red-600'
      : prediction?.environmental_risk === 'WARNING'
      ? 'bg-amber-500'
      : 'bg-[#2A8E77]';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']">Live AI Dosage</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Patient: <strong className="text-white">{activePatient?.name || 'No patient selected'}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => (isAddingPatient ? setIsAddingPatient(false) : handleOpenAddPatient())}
          className="px-5 py-2.5 rounded-full bg-white text-[#2A8E77] font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-xs self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {isAddingPatient ? 'Cancel' : 'Add Patient'}
        </button>
      </div>

      {/* Patient Row */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Users className="w-4 h-4 text-[#2A8E77]" />
            <span>Patients</span>
          </div>
          {activePatient && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenEditPatient}
                className="text-xs font-bold text-[#2A8E77] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => handleDeletePatient(activePatient.id, e)}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Patient Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
          {patients.map((p) => {
            const isActive = activePatient?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPatient(p)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#2A8E77] text-white border-[#2A8E77]'
                    : 'bg-slate-50 hover:bg-[#E8F4F0] text-slate-700 border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75">{p.age}y</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                <button
                  type="button"
                  onClick={(e) => handleDeletePatient(p.id, e)}
                  title={`Remove ${p.name}`}
                  className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ml-1 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-red-600'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {patients.length === 0 && !isAddingPatient && (
            <div className="w-full py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-500">No patients added yet.</p>
              <button
                type="button"
                onClick={handleOpenAddPatient}
                className="px-4 py-2 rounded-xl bg-[#2A8E77] text-white text-xs font-bold hover:bg-[#1e6b5a] transition-all cursor-pointer"
              >
                + Add First Patient
              </button>
            </div>
          )}
        </div>

        {/* Active Patient Info Card */}
        {activePatient && !isAddingPatient && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Age</div>
              <div className="text-lg font-bold text-[#2A8E77]">{activePatient.age} <span className="text-xs text-slate-400">yrs</span></div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">BMI</div>
              <div className="text-lg font-bold text-[#2A8E77]">{calculateBmi(activePatient.mass_kg, activePatient.height_m)}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Smoking</div>
              <div className="text-xs font-bold text-slate-700 mt-1">{activePatient.smoking_status}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Peak Flow</div>
              <div className="text-lg font-bold text-[#2A8E77]">{activePatient.peak_flow} <span className="text-xs text-slate-400">L/min</span></div>
            </div>
          </div>
        )}

        {/* Full Patient Form */}
        {isAddingPatient && (
          <form onSubmit={handleSavePatientForm} className="p-4 bg-[#E8F4F0] rounded-xl space-y-4 text-xs border border-[#2A8E77]/20">
            <h3 className="font-bold text-sm text-[#2A8E77] flex items-center gap-2">
              <User className="w-4 h-4" /> Patient Profile
            </h3>
            
            {/* Row 1: Basics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age (years)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={formAge}
                  onChange={(e) => setFormAge(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  required
                  min={20}
                  max={250}
                  value={formMassKg}
                  onChange={(e) => setFormMassKg(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
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
                  value={formHeightM}
                  onChange={(e) => setFormHeightM(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                />
              </div>
            </div>

            {/* BMI Preview */}
            <div className="flex items-center gap-2 text-xs px-3 py-2 bg-white/80 rounded-lg border border-[#2A8E77]/20">
              <BarChart2 className="w-3.5 h-3.5 text-[#2A8E77]" />
              <span className="text-slate-500">Calculated BMI:</span>
              <span className="font-bold text-[#2A8E77]">{bmiPreview}</span>
              <span className="text-slate-400 ml-1">
                {bmiPreview < 18.5 ? '(Underweight)' : bmiPreview < 25 ? '(Normal)' : bmiPreview < 30 ? '(Overweight)' : '(Obese)'}
              </span>
            </div>

            {/* Row 2: Clinical & Lifestyle */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as PatientProfile['gender'])}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Cigarette className="w-3 h-3" /> Smoking
                </label>
                <select
                  value={formSmokingStatus}
                  onChange={(e) => setFormSmokingStatus(e.target.value as PatientProfile['smoking_status'])}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                >
                  <option value="Non-Smoker">Non-Smoker</option>
                  <option value="Ex-Smoker">Ex-Smoker</option>
                  <option value="Current Smoker">Current Smoker</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" /> Asthma Level
                </label>
                <select
                  value={formAsthmaLevel}
                  onChange={(e) => setFormAsthmaLevel(e.target.value as 'Mild' | 'Moderate' | 'Severe')}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peak Flow (L/min)</label>
                <input
                  type="number"
                  min={50}
                  max={800}
                  value={formPeakFlow}
                  onChange={(e) => setFormPeakFlow(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2A8E77]/30"
                />
              </div>
            </div>

            {/* Smoking risk hint */}
            {formSmokingStatus === 'Current Smoker' && (
              <div className="flex items-center gap-2 text-xs px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Current smoker increases bronchial vulnerability — dosage will be adjusted upward
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2A8E77] text-white font-bold cursor-pointer hover:bg-[#1e6b5a] transition-colors"
              >
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setIsAddingPatient(false)}
                className="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200 font-bold cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Demo Scenarios */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Demo Scenarios</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F4F0] text-[#2A8E77] font-semibold">Tap to simulate</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'clean', label: '🟢 Clean Air', dosage: '50 µL', args: [12, 25, 22, 45] as [number,number,number,number] },
            { name: 'smog', label: '🟡 City Smog', dosage: '100 µL', args: [48, 88, 28, 65] as [number,number,number,number] },
            { name: 'danger', label: '🔴 Danger Zone', dosage: '150 µL', args: [115, 210, 36, 85] as [number,number,number,number] },
            { name: 'cold', label: '🔵 Cold & Damp', dosage: '100 µL', args: [58, 105, 5, 90] as [number,number,number,number] },
          ].map(({ name, label, dosage, args }) => (
            <button
              key={name}
              type="button"
              onClick={() => applyPreset(name, ...args)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col gap-1 text-left ${
                activeScenario === name
                  ? 'bg-[#2A8E77] text-white border-[#2A8E77]'
                  : 'bg-slate-50 hover:bg-[#E8F4F0] text-slate-700 border-slate-200'
              }`}
            >
              <span>{label}</span>
              <span className={`text-[10px] ${activeScenario === name ? 'text-emerald-100' : 'text-slate-400'}`}>{dosage}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sensor Sliders + Dosage Output */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-4">
          <span className="text-xs font-bold text-slate-700 block">Adjust Sensor Readings</span>

          {[
            { key: 'pm25' as const, label: 'PM2.5', unit: 'µg/m³', min: 0, max: 200, icon: <Wind className="w-3.5 h-3.5 text-[#2A8E77]" /> },
            { key: 'aqi' as const, label: 'AQI', unit: '', min: 0, max: 300, icon: <Activity className="w-3.5 h-3.5 text-[#2A8E77]" /> },
            { key: 'temp_c' as const, label: 'Temperature', unit: '°C', min: -10, max: 50, icon: <Thermometer className="w-3.5 h-3.5 text-slate-400" /> },
            { key: 'humidity' as const, label: 'Humidity', unit: '%', min: 0, max: 100, icon: <Droplets className="w-3.5 h-3.5 text-slate-400" /> },
          ].map(({ key, label, unit, min, max, icon }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-600">{icon}{label}</span>
                <span className="font-bold text-slate-900">{sensorInput[key]}{unit}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={sensorInput[key]}
                onChange={(e) => updateSlider(key, Number(e.target.value))}
                className="w-full accent-[#2A8E77] cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Dosage Output */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">AI Recommended Dosage</span>
            {prediction && (
              <Badge variant={riskBadgeVariant(prediction.environmental_risk)} size="md">
                {prediction.environmental_risk}
              </Badge>
            )}
          </div>

          {isComputing && (
            <div className="flex items-center gap-2 text-xs text-[#2A8E77] font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Recomputing dosage...
            </div>
          )}

          {prediction && !isComputing && (() => {
            const dosageCardBg =
              prediction.environmental_risk === 'SAFE'
                ? 'bg-[#2A8E77]'
                : 'bg-red-600';
            const dosageEmoji = DOSAGE_EMOJI[prediction.dosage_amount] || '🟢';
            return (
              <>
                {/* Big dosage display */}
                <div className={`p-6 rounded-2xl ${dosageCardBg} text-white shadow-lg space-y-2`}>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Required Dosage</span>
                <div className="text-5xl font-extrabold font-['Space_Grotesk'] flex items-center gap-3">
                  <span>{dosageEmoji}</span>
                  <span>{prediction.dosage_amount}</span>
                </div>
                <p className="text-xs font-medium opacity-80">{prediction.final_recommendation}</p>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Inhaler Type</div>
                  <div className="font-bold text-slate-800 mt-1">{prediction.model_suggestion}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Protocol</div>
                  <div className="font-bold text-slate-800 mt-1">{prediction.dosage_detail}</div>
                </div>
              </div>

              {/* Risk Reasons */}
              {prediction.risk_reasons.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Factors</span>
                  {prediction.risk_reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <Info className="w-3 h-3 text-[#2A8E77] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Note */}
              <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                prediction.environmental_risk === 'DANGER' ? 'bg-red-50 text-red-800 border border-red-200' :
                prediction.environmental_risk === 'WARNING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {prediction.note}
              </div>
            </>
          );
        })()}

          {!prediction && !isComputing && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Select or add a patient above to see live dosage recommendations
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
