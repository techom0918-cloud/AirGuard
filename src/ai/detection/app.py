import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from risk_engine import assess_environmental_risk, calculate_bmi
from train_medication_model import main as train_model

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "medication_model.joblib")

# Ensure trained Random Forest model exists
if not os.path.exists(MODEL_PATH):
    print("Training Random Forest model on asthma_dataset.csv...")
    train_model()

model = joblib.load(MODEL_PATH)
print("Loaded Random Forest model successfully.")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "RandomForestClassifier", "file": MODEL_PATH})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        sensor = data.get("sensor", {})
        profile = data.get("profile", {})

        age = profile.get("age", 30)
        mass_kg = profile.get("mass_kg", 65)
        height_m = profile.get("height_m", 1.70)
        gender = profile.get("gender", "Female")
        smoking_status = profile.get("smoking_status", "Non-Smoker")
        peak_flow = profile.get("peak_flow", 300)

        pm25 = sensor.get("pm25", 15)
        aqi = sensor.get("aqi", 40)
        humidity = sensor.get("humidity", 50)
        temp_c = sensor.get("temp_c", 24)

        bmi = calculate_bmi(mass_kg, height_m)

        # Stage 1: Environmental Risk Assessment
        risk_res = assess_environmental_risk(
            pm25=pm25,
            aqi=aqi,
            humidity=humidity,
            temp_c=temp_c,
            age=age,
            bmi=bmi,
        )
        risk_level = risk_res["risk_level"]

        # Stage 2: Random Forest Model Inference
        patient_df = pd.DataFrame([{
            "Age": age,
            "Peak_Flow": peak_flow,
            "Gender": gender,
            "Smoking_Status": smoking_status,
        }])

        ml_category = model.predict(patient_df)[0]
        probs = model.predict_proba(patient_df)[0]
        confidence = round(float(max(probs)), 2)

        # Map dosage based on risk level and ML category prediction
        if risk_level == "DANGER":
            dosage_amount = "150 µL"
            dosage_detail = f"Emergency Rescue Exposure Protocol ({ml_category})"
            final_recommendation = f"150 µL SABA Rescue Inhaler volume immediately before exposure"
            note = f"DANGER: Critical environmental risk detected. Model suggests {ml_category}. Take rescue dose & move to clean air."
        elif risk_level == "WARNING":
            dosage_amount = "100 µL"
            dosage_detail = f"Elevated Air Pollution Pre-exposure Shield ({ml_category})"
            final_recommendation = f"100 µL {ml_category} volume before outdoor activity"
            note = f"WARNING: Elevated pollution detected. Model recommends {ml_category} shield dose prior to outdoor activity."
        else:
            dosage_amount = "50 µL"
            dosage_detail = f"Baseline Maintenance Volume ({ml_category})"
            final_recommendation = f"50 µL Maintenance Controller volume — Environment Healthy"
            note = f"Air quality is safe & healthy. Model suggests {ml_category} for baseline maintenance."

        return jsonify({
            "bmi": bmi,
            "environmental_risk": risk_level,
            "risk_reasons": risk_res["reasons"],
            "model_suggestion": f"Random Forest ({ml_category})",
            "model_confidence": confidence,
            "final_recommendation": final_recommendation,
            "dosage_amount": dosage_amount,
            "dosage_detail": dosage_detail,
            "note": note,
            "source": "python-ml"
        })

    except Exception as e:
        print("Error in /predict:", e)
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
