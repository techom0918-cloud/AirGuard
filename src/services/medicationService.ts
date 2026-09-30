/**
 * medicationService.ts
 * ---------------------
 * Talks to the separate Python/Flask ML service (ai/detection/app.py)
 * and includes a client-side real-time fallback AI engine + patient persistence.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_ML_API_BASE_URL || 'http://localhost:5000';

export interface SensorInput {
  pm25: number;
  aqi: number;
  humidity: number;
  temp_c: number;
}

export interface ProfileInput {
  id?: string;
  name?: string;
  age: number;
  mass_kg: number;
  height_m: number;
  gender: 'Male' | 'Female';
  smoking_status: 'Non-Smoker' | 'Ex-Smoker' | 'Current Smoker';
  peak_flow: number;
  asthma_level?: 'Mild' | 'Moderate' | 'Severe';
}

export interface PatientProfile extends ProfileInput {
  id: string;
  name: string;
  createdAt: string;
}

export type EnvironmentalRiskLevel = 'SAFE' | 'WARNING' | 'DANGER';

export interface MedicationPredictionResult {
  bmi: number;
  environmental_risk: EnvironmentalRiskLevel;
  risk_reasons: string[];
  model_suggestion: string;
  model_confidence: number;
  final_recommendation: string;
  dosage_amount: string; // e.g., "50 µL", "100 µL", "150 µL"
  dosage_detail: string;
  note: string;
  source: 'python-ml' | 'client-ai-engine';
  timestamp: string;
}

const PATIENTS_STORAGE_KEY = 'airguard_patient_list_v1';
const ACTIVE_PATIENT_KEY = 'airguard_active_patient_id_v1';

// Initial default patient list (empty by default so user can manage own patients)
const DEFAULT_PATIENTS: PatientProfile[] = [];

/**
 * Calculates BMI: mass_kg / (height_m ^ 2)
 */
export function calculateBmi(massKg: number, heightM: number): number {
  if (!massKg || !heightM || heightM <= 0) return 0;
  return Math.round((massKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Deterministic Client-side AI Fallback Dosage Engine
 * Predicts Environmental Risk, Recommended Medication Category & Dosage Volume (mL)
 * based on live sensor readings + patient bio profile.
 */
export function evaluateClientAiDosage(
  sensor: SensorInput,
  profile: ProfileInput
): MedicationPredictionResult {
  const bmi = calculateBmi(profile.mass_kg, profile.height_m);
  const reasons: string[] = [];

  // 1. Evaluate Environmental Risk Level
  let riskLevel: EnvironmentalRiskLevel = 'SAFE';

  if (sensor.pm25 > 75 || sensor.aqi > 150) {
    riskLevel = 'DANGER';
    reasons.push(`Critical particulate level (PM2.5: ${sensor.pm25} µg/m³, AQI: ${sensor.aqi})`);
  } else if (sensor.pm25 > 35 || sensor.aqi > 70) {
    riskLevel = 'WARNING';
    reasons.push(`Elevated ambient air pollution (PM2.5: ${sensor.pm25} µg/m³)`);
  }

  if (sensor.humidity > 80) {
    if (riskLevel === 'SAFE') riskLevel = 'WARNING';
    reasons.push(`High humidity (${sensor.humidity}%) increases airway reactivity`);
  } else if (sensor.humidity < 25) {
    reasons.push(`Low humidity (${sensor.humidity}%) can dry mucous membranes`);
  }

  if (sensor.temp_c > 35 || sensor.temp_c < 5) {
    if (riskLevel === 'SAFE') riskLevel = 'WARNING';
    reasons.push(`Extreme thermal condition (${sensor.temp_c}°C) triggering bronchospasm risk`);
  }

  // 2. Patient Profile Risk Multiplier
  let patientRiskBonus = 0;
  if (profile.peak_flow < 250) {
    patientRiskBonus += 1;
    reasons.push(`Lower peak expiratory flow rate (${profile.peak_flow} L/min)`);
  } else if (profile.peak_flow < 320) {
    reasons.push(`Borderline peak flow (${profile.peak_flow} L/min) — monitor before outdoor activity`);
  }
  if (profile.smoking_status === 'Current Smoker') {
    patientRiskBonus += 2;
    reasons.push('Active smoker: significantly elevated bronchial inflammation risk');
  } else if (profile.smoking_status === 'Ex-Smoker') {
    patientRiskBonus += 1;
    reasons.push('Ex-smoker: residual airway sensitivity to PM2.5 and ozone');
  }
  if (profile.asthma_level === 'Severe') {
    patientRiskBonus += 2;
    reasons.push('Severe asthma — requires higher prophylactic dosage in any non-clean environment');
  } else if (profile.asthma_level === 'Moderate') {
    patientRiskBonus += 1;
    reasons.push('Moderate asthma — susceptibility to environmental particulate triggers');
  }
  if (bmi > 30) {
    patientRiskBonus += 1;
    reasons.push(`Elevated BMI (${bmi}) — increased respiratory strain and airway resistance`);
  }

  // Upgrade risk level if patient risk bonus is high
  if (patientRiskBonus >= 3 && riskLevel === 'SAFE') {
    riskLevel = 'WARNING';
  } else if (patientRiskBonus >= 2 && riskLevel === 'WARNING') {
    riskLevel = 'DANGER';
  } else if (patientRiskBonus >= 1 && riskLevel === 'WARNING') {
    riskLevel = 'DANGER';
  }

  // 3. Determine Dosage Amount & Medication Category
  let dosageAmount = '50 µL';
  let dosageDetail = 'Baseline Maintenance Aerosol Volume (50 µL)';
  let modelSuggestion = 'Standard Controller Inhaler (ICS)';
  let finalRecommendation = '50 µL Maintenance Inhaler Volume — Environment Healthy';
  let note = 'Air quality is healthy and safe. Baseline 50 µL maintenance volume is sufficient.';

  if (riskLevel === 'DANGER') {
    dosageAmount = '150 µL';
    dosageDetail = 'Emergency Rescue Exposure Protocol (150 µL)';
    modelSuggestion = 'SABA Rescue Inhaler (Albuterol / Salbutamol)';
    finalRecommendation = '150 µL SABA Rescue Inhaler volume immediately before exposure';
    note = 'DANGER: Critical particulate/AQI levels detected. Take 150 µL rescue dose & move to clean indoor air.';
  } else if (riskLevel === 'WARNING') {
    dosageAmount = '100 µL';
    dosageDetail = 'Elevated Air Pollution Pre-exposure Shield (100 µL)';
    modelSuggestion = 'ICS + LABA Combination Inhaler';
    finalRecommendation = '100 µL ICS/LABA Inhaler volume before outdoor activity';
    note = 'WARNING: Elevated ambient pollution detected. Take 100 µL shield dose prior to outdoor activity.';
  }

  if (reasons.length === 0) {
    reasons.push('All environmental sensors are in nominal green zones.');
  }

  return {
    bmi,
    environmental_risk: riskLevel,
    risk_reasons: reasons,
    model_suggestion: modelSuggestion,
    model_confidence: 0.88,
    final_recommendation: finalRecommendation,
    dosage_amount: dosageAmount,
    dosage_detail: dosageDetail,
    note,
    source: 'client-ai-engine',
    timestamp: new Date().toLocaleTimeString(),
  };
}

export const medicationService = {
  /**
   * Retrieves all saved patient profiles from local storage
   */
  getPatients(): PatientProfile[] {
    try {
      const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (stored) {
        const parsed: PatientProfile[] = JSON.parse(stored);
        // Purge old demo patients pat-101 and pat-102 if present
        const filtered = parsed.filter((p) => p.id !== 'pat-101' && p.id !== 'pat-102');
        if (filtered.length !== parsed.length) {
          localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(filtered));
        }
        return filtered;
      }
    } catch (e) {
      console.error('Failed to read patients from localStorage', e);
    }
    return DEFAULT_PATIENTS;
  },

  /**
   * Retrieves active patient profile
   */
  getActivePatient(): PatientProfile | null {
    const patients = this.getPatients();
    if (patients.length === 0) return null;

    const activeId = localStorage.getItem(ACTIVE_PATIENT_KEY);
    const found = patients.find((p) => p.id === activeId);
    return found || patients[0];
  },

  /**
   * Sets active patient ID
   */
  setActivePatientId(id: string): void {
    localStorage.setItem(ACTIVE_PATIENT_KEY, id);
  },

  /**
   * Saves or updates a patient profile and makes it active
   */
  savePatient(profileData: Omit<PatientProfile, 'id' | 'createdAt'> & { id?: string }): PatientProfile {
    const patients = this.getPatients();
    let saved: PatientProfile;

    if (profileData.id) {
      const idx = patients.findIndex((p) => p.id === profileData.id);
      if (idx !== -1) {
        patients[idx] = {
          ...patients[idx],
          ...profileData,
          id: profileData.id,
        };
        saved = patients[idx];
      } else {
        saved = {
          ...profileData,
          id: profileData.id,
          name: profileData.name || 'Patient',
          createdAt: new Date().toISOString(),
        };
        patients.push(saved);
      }
    } else {
      saved = {
        ...profileData,
        id: `pat-${Date.now()}`,
        name: profileData.name || `Patient #${patients.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      patients.push(saved);
    }

    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    localStorage.setItem(ACTIVE_PATIENT_KEY, saved.id);
    return saved;
  },

  /**
   * Deletes a patient profile
   */
  deletePatient(id: string): void {
    let patients = this.getPatients();
    patients = patients.filter((p) => p.id !== id);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    if (patients.length > 0) {
      localStorage.setItem(ACTIVE_PATIENT_KEY, patients[0].id);
    } else {
      localStorage.removeItem(ACTIVE_PATIENT_KEY);
    }
  },

  /**
   * Calls Python Flask ML prediction endpoint or falls back to client-side AI engine
   */
  async predict(sensorInput: SensorInput, profileInput: ProfileInput): Promise<MedicationPredictionResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sensorInput, ...profileInput }),
      });

      if (response.ok) {
        const data = await response.json();
        // Enrich backend JSON response with dosage metrics
        const clientCalc = evaluateClientAiDosage(sensorInput, profileInput);
        return {
          bmi: data.bmi ?? clientCalc.bmi,
          environmental_risk: data.environmental_risk || clientCalc.environmental_risk,
          risk_reasons: data.risk_reasons || clientCalc.risk_reasons,
          model_suggestion: data.model_suggestion || clientCalc.model_suggestion,
          model_confidence: data.model_confidence || clientCalc.model_confidence,
          final_recommendation: data.final_recommendation || clientCalc.final_recommendation,
          dosage_amount: clientCalc.dosage_amount,
          dosage_detail: clientCalc.dosage_detail,
          note: data.note || clientCalc.note,
          source: 'python-ml',
          timestamp: new Date().toLocaleTimeString(),
        };
      }
    } catch (e) {
      // Backend not running; fallback gracefully to client AI engine
    }

    return evaluateClientAiDosage(sensorInput, profileInput);
  },

  /**
   * Check if Python ML endpoint is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
};
