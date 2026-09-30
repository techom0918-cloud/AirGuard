"""
AirGuard - Stage 2: Medication Category Model (Trained on real data)
---------------------------------------------------------------------
This model predicts: Inhaler  vs  Controller Medication

Honest scope note:
Only patients with Asthma_Diagnosis == "Yes" ever receive a medication
in this dataset, so we filter to that group first. The real prediction
task is: among diagnosed patients, which medication category fits their
profile? That is 157 rows and 4 usable features - a small dataset, so
expect modest accuracy. This is why we use cross-validation instead of
trusting a single train/test split, and why Random Forest (not KNN or
SVM) is used - it handles this small mix of categorical + numeric
features without needing careful scaling, and it stays explainable.
"""

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib

DATA_PATH = "asthma_dataset.csv"
MODEL_OUTPUT_PATH = "medication_model.joblib"

NUMERIC_FEATURES = ["Age", "Peak_Flow"]
CATEGORICAL_FEATURES = ["Gender", "Smoking_Status"]
TARGET_COLUMN = "Medication"


def load_and_filter_data(path):
    data = pd.read_csv(path)
    # Only diagnosed patients ever have a medication label
    diagnosed = data[data["Asthma_Diagnosis"] == "Yes"].copy()
    return diagnosed


def build_pipeline():
    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", StandardScaler(), NUMERIC_FEATURES),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=4,          # kept shallow on purpose - small dataset, avoid overfitting
        random_state=42,
        class_weight="balanced",
    )

    pipeline = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("classifier", model),
    ])
    return pipeline


def evaluate_with_cross_validation(pipeline, features, target):
    # 5-fold cross-validation is more trustworthy than one split on this little data
    folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(pipeline, features, target, cv=folds, scoring="accuracy")
    print(f"Cross-validation accuracy per fold: {[round(s, 3) for s in scores]}")
    print(f"Mean cross-validation accuracy: {scores.mean():.3f}")


def evaluate_with_holdout(pipeline, features, target):
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.25, stratify=target, random_state=42
    )
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    print("\nHold-out test set report:")
    print(classification_report(y_test, predictions))
    print("Confusion matrix (rows = actual, columns = predicted):")
    print(confusion_matrix(y_test, predictions, labels=pipeline.classes_))
    print("Class order:", list(pipeline.classes_))


def train_final_model(pipeline, features, target):
    # After validating above, refit on ALL usable rows for the deployed model.
    # Standard practice when the dataset is this small - every row counts.
    pipeline.fit(features, target)
    return pipeline


def main():
    data = load_and_filter_data(DATA_PATH)
    print(f"Usable rows (diagnosed patients only): {len(data)}")
    print(data[TARGET_COLUMN].value_counts())

    features = data[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    target = data[TARGET_COLUMN]

    pipeline = build_pipeline()

    evaluate_with_cross_validation(pipeline, features, target)
    evaluate_with_holdout(build_pipeline(), features, target)  # fresh pipeline for a clean holdout run

    final_model = train_final_model(pipeline, features, target)
    joblib.dump(final_model, MODEL_OUTPUT_PATH)
    print(f"\nSaved trained model to: {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
