# AirGuard - AI/Detection Module

## Files
- `risk_engine.py` — Stage 1: rule-based SAFE/WARNING/DANGER logic from sensor readings.
  Reliable, deterministic, no training needed.
- `train_medication_model.py` — Stage 2: trains a Random Forest on `asthma_dataset.csv`
  to suggest a medication category. Run this once to produce `medication_model.joblib`.
- `predict_pipeline.py` — Combines both stages into one function. Applies a
  safety-first rule: a DANGER risk level always overrides the model's suggestion
  with "Inhaler".
- `asthma_dataset.csv` — the source data used to train Stage 2.

## Setup
```
pip install pandas scikit-learn joblib
```

## Run order
```
python train_medication_model.py   # trains and saves medication_model.joblib
python predict_pipeline.py         # loads the saved model, runs a sample prediction
```

## Known limitation (be upfront about this)
Cross-validated accuracy of `train_medication_model.py` is ~44-48% on a 2-class
problem — close to random guessing. Checking the raw data shows no real
relationship between the available features (Age, Gender, Smoking_Status,
Peak_Flow) and the medication label. This is a property of the dataset, not a
fixable modeling choice. Present Stage 1 as the trustworthy "AI" component;
label Stage 2's output as experimental/low-confidence if you show it at all.
