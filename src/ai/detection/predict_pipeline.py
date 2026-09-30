"""
AirGuard - Combined Inference Pipeline
----------------------------------------
Takes: live sensor readings + a short user profile
Returns: environmental risk level + a medication-category suggestion

IMPORTANT CAVEAT (read before demoing this):
The Stage 2 model in this pipeline was trained on asthma_dataset.csv,
and evaluation showed it performs close to random guessing (~45-50%
accuracy on a 2-class problem) - see the output of
train_medication_model.py. That dataset does not contain a real
relationship between Age/Gender/Smoking_Status/Peak_Flow and the
medication a patient was given. This is a limitation of the dataset,
not something fixable by switching algorithms.

This script still works end-to-end, but the SAFE/WARNING/DANGER
decision from Stage 1 (rule_engine.py) should be treated as the
trustworthy output. Stage 2's suggestion should be labelled clearly as
exploratory / low-confidence if you show it at all.
"""

import pandas as pd
import joblib

from risk_engine import assess_environmental_risk, calculate_bmi

MODEL_PATH = "medication_model.joblib"


def load_medication_model(path=MODEL_PATH):
    return joblib.load(path)


def build_patient_row(age, gender, smoking_status, peak_flow):
    return pd.DataFrame([{
        "Age": age,
        "Peak_Flow": peak_flow,
        "Gender": gender,
        "Smoking_Status": smoking_status,
    }])


def run_pipeline(sensor_data, user_profile, medication_model):
    """
    sensor_data: dict with keys pm25, aqi, humidity, temp_c
    user_profile: dict with keys age, mass_kg, height_m, gender,
                  smoking_status, peak_flow
    """
    bmi = calculate_bmi(user_profile["mass_kg"], user_profile["height_m"])

    stage1_result = assess_environmental_risk(
        pm25=sensor_data["pm25"],
        aqi=sensor_data["aqi"],
        humidity=sensor_data["humidity"],
        temp_c=sensor_data["temp_c"],
        age=user_profile["age"],
        bmi=bmi,
    )
    risk_level = stage1_result["risk_level"]

    patient_row = build_patient_row(
        age=user_profile["age"],
        gender=user_profile["gender"],
        smoking_status=user_profile["smoking_status"],
        peak_flow=user_profile["peak_flow"],
    )

    base_prediction = medication_model.predict(patient_row)[0]
    class_probabilities = medication_model.predict_proba(patient_row)[0]
    confidence = round(max(class_probabilities), 2)

    # Rule-based safety override sits ON TOP of the ML output.
    # Immediate physical safety always outranks a statistical suggestion.
    if risk_level == "DANGER":
        final_recommendation = "Inhaler"
        note = "Escalated to Inhaler because environmental risk is DANGER, regardless of model suggestion"
    elif risk_level == "WARNING":
        final_recommendation = base_prediction
        note = "Model suggestion kept, but keep a rescue inhaler accessible given WARNING level"
    else:
        final_recommendation = base_prediction
        note = "Environmental conditions are safe; model suggestion used as-is"

    return {
        "bmi": bmi,
        "environmental_risk": risk_level,
        "risk_reasons": stage1_result["reasons"],
        "model_suggestion": base_prediction,
        "model_confidence": confidence,
        "final_recommendation": final_recommendation,
        "note": note,
    }


if __name__ == "__main__":
    model = load_medication_model()

    example_sensor_data = {"pm25": 170, "aqi": 210, "humidity": 65, "temp_c": 27}
    example_user_profile = {
        "age": 34,
        "mass_kg": 68,
        "height_m": 1.70,
        "gender": "Female",
        "smoking_status": "Non-Smoker",
        "peak_flow": 260,
    }

    output = run_pipeline(example_sensor_data, example_user_profile, model)
    for key, value in output.items():
        print(f"{key}: {value}")
