"""
AirGuard - Stage 1: Environmental Risk Engine
----------------------------------------------
This is deliberately RULE-BASED, not machine-learned.

Why: there is no public dataset that pairs a specific person's real-time
air exposure (PM2.5, AQI, humidity, temperature) with their personal
symptom severity. That mapping is clinical, personalized, and not
available in open data, so training a model to invent it would not be
backed by real evidence. Medically-informed thresholds are what real
smart-inhaler products use for this exact reason.

This module turns raw sensor + patient values into one of:
    SAFE / WARNING / DANGER
"""

RISK_LEVELS = ["SAFE", "WARNING", "DANGER"]


def calculate_bmi(mass_kg, height_m):
    """Simple BMI = mass (kg) / height (m) ^ 2."""
    if height_m <= 0:
        raise ValueError("height_m must be greater than 0")
    return round(mass_kg / (height_m ** 2), 1)


def _pm25_level(value):
    if value > 150:
        return "DANGER"
    if value >= 55:
        return "WARNING"
    return "SAFE"


def _aqi_level(value):
    # Assumes a 0-500 style AQI scale (e.g. from an MQ-135 style sensor)
    if value > 200:
        return "DANGER"
    if value >= 100:
        return "WARNING"
    return "SAFE"


def _escalate(level):
    """Bump a risk level up by one step, capped at DANGER."""
    index = RISK_LEVELS.index(level)
    return RISK_LEVELS[min(index + 1, len(RISK_LEVELS) - 1)]


def assess_environmental_risk(pm25, aqi, humidity, temp_c, age=None, bmi=None):
    """
    Combine sensor readings (and optional patient vulnerability factors)
    into a single SAFE / WARNING / DANGER risk level.

    Parameters
    ----------
    pm25 : float        -> from dust/PM2.5 sensor
    aqi  : float         -> from gas/AQI sensor (e.g. MQ-135)
    humidity : float     -> percent relative humidity
    temp_c : float       -> temperature in Celsius
    age : float or None  -> optional, used as a vulnerability modifier
    bmi : float or None  -> optional, used as a vulnerability modifier

    Returns
    -------
    dict with keys: risk_level, reasons (list of strings explaining why)
    """
    reasons = []

    # Step 1: take the worse of the two primary pollutant readings
    pm25_level = _pm25_level(pm25)
    aqi_level = _aqi_level(aqi)
    primary_level = RISK_LEVELS[max(RISK_LEVELS.index(pm25_level),
                                     RISK_LEVELS.index(aqi_level))]

    if pm25_level != "SAFE":
        reasons.append(f"PM2.5 reading ({pm25}) is at {pm25_level} level")
    if aqi_level != "SAFE":
        reasons.append(f"AQI reading ({aqi}) is at {aqi_level} level")

    level = primary_level

    # Step 2: humidity/temperature act as modifiers, not primary triggers
    humidity_out_of_range = humidity < 30 or humidity > 70
    temp_out_of_range = temp_c < 10 or temp_c > 38

    if humidity_out_of_range and level != "DANGER":
        level = _escalate(level)
        reasons.append(f"Humidity ({humidity}%) is outside the comfortable range")

    if temp_out_of_range and level != "DANGER":
        level = _escalate(level)
        reasons.append(f"Temperature ({temp_c}C) is outside the comfortable range")

    # Step 3: patient vulnerability modifiers (age / BMI), optional
    vulnerable = False
    if age is not None and (age < 12 or age > 65):
        vulnerable = True
        reasons.append(f"Age ({age}) is in a more vulnerable group")
    if bmi is not None and bmi < 18.5:
        vulnerable = True
        reasons.append(f"BMI ({bmi}) indicates lower respiratory reserve")

    if vulnerable and level != "DANGER":
        level = _escalate(level)

    if not reasons:
        reasons.append("All readings are within safe range")

    return {"risk_level": level, "reasons": reasons}


if __name__ == "__main__":
    # Quick manual check
    sample_mass = 55
    sample_height = 1.65
    sample_bmi = calculate_bmi(sample_mass, sample_height)

    result = assess_environmental_risk(
        pm25=120, aqi=90, humidity=75, temp_c=30, age=70, bmi=sample_bmi
    )
    print("BMI:", sample_bmi)
    print(result)
