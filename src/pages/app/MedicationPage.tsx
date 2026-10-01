import React, { useEffect, useState } from 'react';
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
  Radio,
  Zap,
  Cpu,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { environmentService } from '../../services/environmentService';
import { backendTelemetryService, RawTelemetry } from '../../services/backendTelemetryService';
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
  const [rawTelemetry, setRawTelemetry] = useState<RawTelemetry | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

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

  // Live Dosage Prediction
  const [prediction, setPrediction] = useState<MedicationPredictionResult | null>(null);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [lastInferenceTime, setLastInferenceTime] = useState<string>('Just now');

  // Load patient profiles
  useEffect(() => {
    const loadedPatients = medicationService.getPatients();
    setPatients(loadedPatients);
    const active = medicationService.getActivePatient();
    setActivePatient(active);
  }, []);

  // Subscribe to real-time backend telemetry
  useEffect(() => {
    // Initial fetch of current state
    const currentSnap = backendTelemetryService.getLatestSnapshot();
    const currentRaw = backendTelemetryService.getLatestRaw();
    if (currentSnap) setSnapshot(currentSnap);
    if (currentRaw) setRawTelemetry(currentRaw);
    setIsConnected(backendTelemetryService.isConnected());

    // Subscribe to continuous snapshot updates
    const unsubSnap = environmentService.subscribeToSnapshot((snap) => {
      setSnapshot(snap);
    });

    // Subscribe to raw telemetry stream
    const unsubRaw = backendTelemetryService.subscribeToRawTelemetry((raw) => {
      setRawTelemetry(raw);
    });

    // Subscribe to connection state changes
    const unsubConn = backendTelemetryService.subscribeToConnection((conn) => {
      setIsConnected(conn);
    });

    return () => {
      unsubSnap();
      unsubRaw();
      unsubConn();
    };
  }, []);

  // Re-run AI model prediction whenever snapshot or activePatient changes
  useEffect(() => {
    if (!activePatient || !snapshot) return;

    setIsComputing(true);
    let cancelled = false;

    const sensorInput: SensorInput = {
      pm25: snapshot.pm25.value,
      aqi: snapshot.riskScore,
      humidity: snapshot.humidity.value,
      temp_c: snapshot.temperature.value,
    };

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
          setLastInferenceTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [snapshot, activePatient]);

  const handleSelectPatient = (patient: PatientProfile) => {
    medicationService.setActivePatientId(patient.id);
    setActivePatient({ ...patient });
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
    setActivePatient({ ...saved });
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

  if (!snapshot) return <LoadingState message="Loading backend telemetry..." />;

  const bmiPreview = calculateBmi(formMassKg, formHeightM);
  const dosageEmoji = prediction ? (DOSAGE_EMOJI[prediction.dosage_amount] ?? '🟡') : '⏳';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] flex items-center gap-3">
            <span>Live AI Dosage Predictor</span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
              Real-Time Hardware Stream
            </span>
          </h1>
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

      {/* Patient Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Users className="w-4 h-4 text-[#2A8E77]" />
            <span>Active Patient Profile</span>
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
              <div className="text-lg font-bold text-[#2A8E77]">
                {activePatient.age} <span className="text-xs text-slate-400">yrs</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">BMI</div>
              <div className="text-lg font-bold text-[#2A8E77]">
                {calculateBmi(activePatient.mass_kg, activePatient.height_m)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Smoking</div>
              <div className="text-xs font-bold text-slate-700 mt-1">{activePatient.smoking_status}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F4F0] text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Peak Flow</div>
              <div className="text-lg font-bold text-[#2A8E77]">
                {activePatient.peak_flow} <span className="text-xs text-slate-400">L/min</span>
              </div>
            </div>
          </div>
        )}

        {/* Patient Form */}
        {isAddingPatient && (
          <form onSubmit={handleSavePatientForm} className="p-4 bg-[#E8F4F0] rounded-xl space-y-4 text-xs border border-[#2A8E77]/20">
            <h3 className="font-bold text-sm text-[#2A8E77] flex items-center gap-2">
              <User className="w-4 h-4" /> Patient Profile Setup
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Siddharth Shukla"
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

            <div className="flex items-center gap-2 text-xs px-3 py-2 bg-white/80 rounded-lg border border-[#2A8E77]/20">
              <BarChart2 className="w-3.5 h-3.5 text-[#2A8E77]" />
              <span className="text-slate-500">Calculated BMI:</span>
              <span className="font-bold text-[#2A8E77]">{bmiPreview}</span>
              <span className="text-slate-400 ml-1">
                {bmiPreview < 18.5 ? '(Underweight)' : bmiPreview < 25 ? '(Normal)' : bmiPreview < 30 ? '(Overweight)' : '(Obese)'}
              </span>
            </div>

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

      {/* Main Grid: Real-Time Hardware Telemetry Panel (Left) + AI Dosage Model Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Live Backend ESP32 Telemetry */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#2A8E77]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Sensor Telemetry
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className={isConnected ? 'text-emerald-700' : 'text-amber-700'}>
                {isConnected ? `${rawTelemetry?.device_id || 'AG-001'} Live` : 'Connecting ESP32...'}
              </span>
            </div>
          </div>

          {/* Live Sensor Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* PM2.5 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-[#2A8E77]" /> PM2.5
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E8F4F0] text-[#2A8E77]">Calculated</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {snapshot.pm25.value} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
            </div>

            {/* AQI Score */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#2A8E77]" /> AQI Score
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase font-extrabold">
                  {rawTelemetry?.risk_level || snapshot.riskLevel}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {snapshot.riskScore}
              </div>
            </div>

            {/* Temperature */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-slate-400" /> Temperature
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {rawTelemetry?.temp !== undefined ? rawTelemetry.temp : snapshot.temperature.value}°C
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-slate-400" /> Humidity
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {rawTelemetry?.humidity !== undefined ? rawTelemetry.humidity : snapshot.humidity.value}%
              </div>
            </div>

            {/* MQ135 Raw ADC */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> MQ135 Raw ADC
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {rawTelemetry?.mq135_raw ?? '871'}
              </div>
            </div>

            {/* Sensor Voltage */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-indigo-500" /> Sensor Signal
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {rawTelemetry?.sensor_voltage !== undefined ? `${rawTelemetry.sensor_voltage} V` : '1.40 V'}
              </div>
            </div>
          </div>

          {/* Model Features Pipeline Banner */}
          <div className="p-3 rounded-xl bg-[#E8F4F0] border border-[#2A8E77]/20 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#2A8E77]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Random Forest Pipeline Input
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Updated {lastInferenceTime}</span>
            </div>
            <div className="text-[11px] text-slate-600 font-mono bg-white/70 p-2 rounded-lg border border-[#2A8E77]/10 truncate">
              PM2.5: {snapshot.pm25.value} | AQI: {snapshot.riskScore} | Temp: {snapshot.temperature.value}°C | Age: {activePatient?.age || 30}y | PeakFlow: {activePatient?.peak_flow || 300} L/min
            </div>
          </div>
        </div>

        {/* Right Column: AI Dosage Recommendation Output */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#2A8E77]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  AI Recommended Dosage Output
                </span>
              </div>
              {prediction && (
                <Badge variant={riskBadgeVariant(prediction.environmental_risk)} size="md">
                  {prediction.environmental_risk}
                </Badge>
              )}
            </div>

            {isComputing && (
              <div className="flex items-center gap-2 text-xs text-[#2A8E77] font-semibold py-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Evaluating Random Forest model on live backend frame...
              </div>
            )}

            {prediction && !isComputing && (() => {
              const isWarning = prediction.environmental_risk !== 'SAFE';
              // Force RED bg for any warning/danger level
              const dosageCardBg = isWarning ? 'bg-red-600' : 'bg-[#2A8E77]';
              const dosageEmoji = isWarning ? '🔴' : '🟢';

              return (
                <div className="space-y-4">
                  {/* Dosage Display Box */}
                  <div className={`p-6 rounded-2xl ${dosageCardBg} text-white shadow-lg space-y-2`}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                      Required Recommended Dose
                    </span>
                    <div className="text-5xl font-extrabold font-['Space_Grotesk'] flex items-center gap-3">
                      <span>{dosageEmoji}</span>
                      <span>{prediction.dosage_amount}</span>
                    </div>
                    <p className="text-xs font-medium opacity-90">{prediction.final_recommendation}</p>
                  </div>

                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Inhaler Type</div>
                      <div className="font-bold text-slate-800 mt-1">{prediction.model_suggestion}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Dosing Protocol</div>
                      <div className="font-bold text-slate-800 mt-1">{prediction.dosage_detail}</div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {prediction.risk_reasons.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Environmental & Clinical Risk Factors
                      </span>
                      {prediction.risk_reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <Info className="w-3.5 h-3.5 text-[#2A8E77] shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Alert Banner */}
                  <div
                    className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                      isWarning
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{prediction.note}</span>
                  </div>
                </div>
              );
            })()}

            {!prediction && !isComputing && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select or add a patient profile above to generate live AI dosage recommendations
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
            <span>Model: RandomForestClassifier (asthma_dataset.csv)</span>
            <span>Units: Microliters (µL)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
