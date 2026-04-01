"""
train_model.py  ─  MenopaAI ML Training Script
================================================
Reads the research survey CSV, engineers features, trains classifiers for:
  1. Menopause Stage      (Pre / Peri / Post)
  2. Symptom Severity     (Mild / Moderate / Severe)
  3. Osteoporosis Risk    (Low / Medium / High)
  4. Cardiovascular Risk  (Low / Medium / High)
  5. Hormonal Imbalance   (Yes / No)
  6. Reproductive Profile (Fertile/Normal | At Risk | Complicated)

Saves all models + label encoders to ./models/
Run once before starting app.py.
"""

import os, re, warnings, json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.utils import resample

warnings.filterwarnings("ignore")

# ─── Paths ────────────────────────────────────────────────────────────────────
AUGMENTED_PATH = r"..\data\synthetic_augmented_data.csv"
ORIGINAL_PATH  = r"..\data\research survey.csv (1)\research survey.csv"
CSV_PATH = AUGMENTED_PATH if os.path.exists(AUGMENTED_PATH) else ORIGINAL_PATH
MODEL_DIR  = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ─── 1. Load CSV ──────────────────────────────────────────────────────────────
try:
    df = pd.read_csv(CSV_PATH, on_bad_lines='skip')
except Exception as e:
    print(f"Error loading augmented CSV: {e}, falling back to original")
    CSV_PATH = ORIGINAL_PATH
    df = pd.read_csv(CSV_PATH, on_bad_lines='skip')
print(f"Using: {CSV_PATH}")
print(f"Loaded {len(df)} rows, {len(df.columns)} columns")

# Keep only consenting rows
df = df[df.iloc[:, 1].str.contains("voluntarily", case=False, na=False)].copy()
print(f"After consent filter: {len(df)} rows")
df = df.reset_index(drop=True)

# ─── 2. Rename columns for convenience ───────────────────────────────────────
col_map = {
    df.columns[2]:  "age",
    df.columns[3]:  "province",
    df.columns[4]:  "area",
    df.columns[5]:  "marital_status",
    df.columns[12]: "height_raw",
    df.columns[13]: "weight_raw",
    df.columns[14]: "diagnoses",
    df.columns[15]: "menarche_age",
    df.columns[16]: "cycle_pattern",
    df.columns[17]: "current_menstrual_status",
    df.columns[18]: "menopause_age",
    df.columns[19]: "early_menopause",
    # Symptoms (cols 20‥35 = hot flashes…recurrent UTI)
    df.columns[20]: "hot_flashes",
    df.columns[21]: "night_sweats",
    df.columns[22]: "vaginal_dryness",
    df.columns[23]: "pain_intercourse",
    df.columns[24]: "mood_swings",
    df.columns[25]: "anxiety",
    df.columns[26]: "depression",
    df.columns[27]: "irritability",
    df.columns[28]: "sleep_disturbances",
    df.columns[29]: "memory_issues",
    df.columns[30]: "joint_pain",
    df.columns[31]: "muscle_pain",
    df.columns[32]: "fatigue",
    df.columns[33]: "hair_thinning",
    df.columns[34]: "weight_gain_symptom",
    df.columns[35]: "recurrent_uti",
    # Reproductive
    df.columns[36]: "num_pregnancies",
    df.columns[37]: "live_births",
    df.columns[38]: "miscarriages",
    df.columns[39]: "stillbirth",
    df.columns[40]: "ectopic",
    df.columns[41]: "delivery_mode",
    df.columns[42]: "breastfeeding",
    df.columns[43]: "infertility_attempt",
    df.columns[44]: "pcos_diagnosis",
    df.columns[45]: "pcos_symptoms",
    df.columns[46]: "infertility_treatment",
    df.columns[47]: "other_conditions",
    # Lifestyle
    df.columns[49]: "decreased_libido",
    df.columns[51]: "urinary_urgency",
    df.columns[54]: "smoking",
    df.columns[55]: "tobacco",
    df.columns[56]: "physical_activity",
    df.columns[57]: "diet",
    df.columns[58]: "sun_exposure",
    df.columns[59]: "stress_level",
    df.columns[60]: "family_history",
}
df = df.rename(columns=col_map)

# ─── 3. Helper: clean numeric ─────────────────────────────────────────────────
def to_num(s):
    try:
        s2 = re.sub(r"[^\d.]", "", str(s))
        return float(s2) if s2 else np.nan
    except:
        return np.nan

df["age"]    = df["age"].apply(to_num)
df["weight"] = df["weight_raw"].apply(to_num)

def to_height_cm(s):
    s = str(s).strip().lower()
    # feet notation e.g. "5.4", "5'4", "5 feet 2 inch"
    m = re.search(r"(\d+)['\s.](\d+)", s)
    if m:
        return float(m.group(1)) * 30.48 + float(m.group(2)) * 2.54
    v = to_num(s)
    if v and v < 10:   # probably feet
        return v * 30.48
    return v

df["height"] = df["height_raw"].apply(to_height_cm)
df["bmi"] = df["weight"] / (df["height"] / 100) ** 2
df["bmi"] = df["bmi"].clip(10, 60)

# ─── 4. Symptom scoring ───────────────────────────────────────────────────────
SYMPTOM_COLS = [
    "hot_flashes","night_sweats","vaginal_dryness","pain_intercourse",
    "mood_swings","anxiety","depression","irritability","sleep_disturbances",
    "memory_issues","joint_pain","muscle_pain","fatigue","hair_thinning",
    "weight_gain_symptom","recurrent_uti"
]

freq_score = {
    "never": 0, "rarely": 1, "sometimes": 1,
    "often": 1, "severe / daily": 2, "": 0
}

def symptom_pts(val):
    v = str(val).strip().lower()
    for k, s in freq_score.items():
        if k in v:
            return s
    return 0

df["symptom_score"] = df[SYMPTOM_COLS].applymap(symptom_pts).sum(axis=1)

# ─── 5. Label: Menopause Stage ────────────────────────────────────────────────
def menopause_stage(row):
    status = str(row.get("current_menstrual_status", "")).lower()
    if "no periods for>12" in status or "no periods for >12" in status:
        return "Post-menopause"
    if "irregular" in status or "no periods for<12" in status or "no periods for <12" in status:
        return "Peri-menopause"
    if "regular" in status:
        return "Pre-menopause"
    # Fallback: age
    age = row.get("age", 45)
    if pd.isna(age): age = 45
    if age < 45: return "Pre-menopause"
    if age < 52: return "Peri-menopause"
    return "Post-menopause"

df["stage_label"] = df.apply(menopause_stage, axis=1)
print("Stage distribution:\n", df["stage_label"].value_counts())

# ─── 6. Label: Symptom Severity ───────────────────────────────────────────────
def severity_label(score):
    if score <= 3:  return "Mild"
    if score <= 7:  return "Moderate"
    return "Severe"

df["severity_label"] = df["symptom_score"].apply(severity_label)
print("Severity distribution:\n", df["severity_label"].value_counts())

# ─── 7. Label: Osteoporosis Risk ──────────────────────────────────────────────
def osteo_risk(row):
    score = 0
    age = row.get("age", 40)
    if pd.isna(age): age = 40
    if age > 55: score += 2
    elif age > 45: score += 1
    diag = str(row.get("diagnoses","")).lower()
    fam  = str(row.get("family_history","")).lower()
    if "osteoporosis" in diag or "osteoporosis" in fam: score += 3
    if "vitamin d" in diag: score += 1
    stage = str(row.get("stage_label","")).lower()
    if "post" in stage: score += 2
    elif "peri" in stage: score += 1
    activity = str(row.get("physical_activity","")).lower()
    if "sedentary" in activity: score += 1
    bmi = row.get("bmi", 22)
    if pd.isna(bmi): bmi = 22
    if bmi < 18.5: score += 1
    if score >= 5: return "High"
    if score >= 3: return "Medium"
    return "Low"

df["osteo_label"] = df.apply(osteo_risk, axis=1)
print("Osteo distribution:\n", df["osteo_label"].value_counts())

# ─── 8. Label: Cardiovascular Risk ───────────────────────────────────────────
def cardio_risk(row):
    score = 0
    diag = str(row.get("diagnoses","")).lower()
    fam  = str(row.get("family_history","")).lower()
    if "heart disease" in diag or "heart" in fam: score += 3
    if "hypertension" in diag: score += 2
    if "diabetes" in diag or "diabetes" in fam: score += 2
    if row.get("smoking","") in ["yes","current","former"]: score += 1  # any tobacco use
    if str(row.get("tobacco","")).lower() not in ["no","never",""]: score += 1
    bmi = row.get("bmi", 22)
    if pd.isna(bmi): bmi = 22
    if bmi >= 30: score += 2
    elif bmi >= 25: score += 1
    activity = str(row.get("physical_activity","")).lower()
    if "sedentary" in activity: score += 1
    stress = to_num(row.get("stress_level", 2))
    if pd.isna(stress): stress = 2
    if stress >= 4: score += 1
    if score >= 6: return "High"
    if score >= 3: return "Medium"
    return "Low"

df["cardio_label"] = df.apply(cardio_risk, axis=1)
print("Cardio distribution:\n", df["cardio_label"].value_counts())

# ─── 9. Label: Hormonal Imbalance ────────────────────────────────────────────
def hormonal_imbalance(row):
    pcos = str(row.get("pcos_diagnosis","")).lower()
    symptoms = str(row.get("pcos_symptoms","")).lower()
    thyroid = str(row.get("diagnoses","")).lower()
    early = str(row.get("early_menopause","")).lower()
    if ("yes" in pcos or "suspected" in pcos or
        "irregular periods" in symptoms or "excess facial hair" in symptoms or
        "thyroid" in thyroid or "yes" in early):
        return "Yes"
    return "No"

df["hormonal_label"] = df.apply(hormonal_imbalance, axis=1)
print("Hormonal distribution:\n", df["hormonal_label"].value_counts())

# ─── 10. Label: Reproductive Profile ─────────────────────────────────────────
def repro_profile(row):
    pcos  = str(row.get("pcos_diagnosis","")).lower()
    infert= str(row.get("infertility_attempt","")).lower()
    treat = str(row.get("infertility_treatment","")).lower()
    cond  = str(row.get("other_conditions","")).lower()
    misc_raw = to_num(row.get("miscarriages", 0))
    misc  = int(misc_raw) if not pd.isna(misc_raw) else 0
    still = str(row.get("stillbirth","")).lower()
    ectop = str(row.get("ectopic","")).lower()

    score_complicated = 0
    if misc >= 2: score_complicated += 2
    elif misc >= 1: score_complicated += 1
    if "yes" in still: score_complicated += 2
    if "yes" in ectop: score_complicated += 2
    if any(x in cond for x in ["fibroid","prolapse","endometriosis","adenomyosis","ovarian cancer","cervical cancer"]): score_complicated += 2

    score_at_risk = 0
    if "yes" in pcos or "suspected" in pcos: score_at_risk += 2
    if "yes" in infert: score_at_risk += 2
    if treat and treat not in ["no","none",""]: score_at_risk += 1

    if score_complicated >= 2: return "Complicated Reproductive History"
    if score_at_risk >= 2:     return "At Risk (PCOS/Infertility)"
    return "Fertile/Normal"

df["repro_label"] = df.apply(repro_profile, axis=1)
print("Repro distribution:\n", df["repro_label"].value_counts())

# ─── 11. Feature Engineering ─────────────────────────────────────────────────
def encode_freq(s):
    v = str(s).strip().lower()
    if "severe" in v: return 2
    if "often"  in v: return 1
    if "sometimes" in v: return 1
    if "rarely" in v: return 0
    return 0  # never / blank

def cycle_enc(s):
    v = str(s).lower()
    if "regular" in v and "irregular" not in v: return 0
    if "irregular" in v: return 1
    if "heavy" in v: return 2
    if "painful" in v: return 2
    return 3

def activity_enc(s):
    v = str(s).lower()
    if "sedentary" in v: return 0
    if "light" in v or "moderate" in v: return 1
    if "heavy" in v or "extreme" in v: return 2
    if "active" in v: return 2
    return 1

def diet_enc(s):
    v = str(s).lower()
    if "fast food" in v or "processed" in v: return 0
    if "high-fat" in v or "high-carb" in v: return 0
    if "balanced" in v or "vegetarian" in v or "high-protein" in v: return 2
    return 1

def stress_enc(s):
    n = to_num(s)
    if pd.isna(n): return 2
    try: return int(n)
    except: return 2

feature_cols = []
# Symptom scores
for col in SYMPTOM_COLS:
    df[f"s_{col}"] = df[col].apply(encode_freq)
    feature_cols.append(f"s_{col}")

# Demographics
df["age_f"]      = pd.to_numeric(df["age"], errors="coerce").fillna(40).clip(18, 75)
df["bmi_f"]      = pd.to_numeric(df["bmi"], errors="coerce").fillna(23).clip(10, 60)
df["cycle_f"]    = df["cycle_pattern"].apply(cycle_enc)
df["activity_f"] = df["physical_activity"].apply(activity_enc)
df["diet_f"]     = df["diet"].apply(diet_enc)
df["stress_f"]   = df["stress_level"].apply(stress_enc)
df["sym_score"]  = df["symptom_score"]

feature_cols += ["age_f","bmi_f","cycle_f","activity_f","diet_f","stress_f","sym_score"]

# Medical flags
df["has_diabetes"]   = df["diagnoses"].str.contains("diabetes", case=False, na=False).astype(int)
df["has_htn"]        = df["diagnoses"].str.contains("hypertension", case=False, na=False).astype(int)
df["has_thyroid"]    = df["diagnoses"].str.contains("thyroid", case=False, na=False).astype(int)
df["has_anemia"]     = df["diagnoses"].str.contains("anemia", case=False, na=False).astype(int)
df["has_vitd"]       = df["diagnoses"].str.contains("vitamin d", case=False, na=False).astype(int)
df["has_heart"]      = df["diagnoses"].str.contains("heart", case=False, na=False).astype(int)
df["has_osteo"]      = df["diagnoses"].str.contains("osteoporosis", case=False, na=False).astype(int)
df["smokes"]         = df["smoking"].fillna("").str.lower().isin(["yes","current","former"]).astype(int)
df["tobacco_use"]    = (~df["tobacco"].fillna("").str.lower().isin(["no","never",""])).astype(int)
df["pcos_flag"]      = df["pcos_diagnosis"].fillna("").str.contains("yes|suspected|confirmed", case=False, na=False).astype(int)
df["infert_flag"]    = df["infertility_attempt"].fillna("").str.lower().str.contains("yes", na=False).astype(int)
df["early_meno_f"]   = df["early_menopause"].fillna("").str.lower().str.contains("yes", na=False).astype(int)
df["fam_osteo"]      = df["family_history"].str.contains("osteoporosis", case=False, na=False).astype(int)
df["fam_cardio"]     = df["family_history"].str.contains("heart|cardiovascular", case=False, na=False).astype(int)
df["fam_diabetes"]   = df["family_history"].str.contains("diabetes", case=False, na=False).astype(int)

flag_cols = ["has_diabetes","has_htn","has_thyroid","has_anemia","has_vitd","has_heart",
             "has_osteo","smokes","tobacco_use","pcos_flag","infert_flag","early_meno_f",
             "fam_osteo","fam_cardio","fam_diabetes"]
feature_cols += flag_cols

X = df[feature_cols].fillna(0)

# ─── 12. Train helpers ────────────────────────────────────────────────────────
model_accuracies = {}

def balance_and_train(X_all, y_all, name, n_estimators=200):
    """Oversample minority classes then train RF. Returns (clf, accuracy)."""
    combined = pd.concat([X_all.reset_index(drop=True),
                          y_all.reset_index(drop=True)], axis=1)
    target_col = combined.columns[-1]
    majority_n = combined[target_col].value_counts().max()
    parts = []
    for cls in combined[target_col].unique():
        sub = combined[combined[target_col] == cls]
        parts.append(resample(sub, replace=True, n_samples=majority_n, random_state=42))
    balanced = pd.concat(parts)
    Xb = balanced.drop(columns=[target_col])
    yb = balanced[target_col]

    clf = RandomForestClassifier(n_estimators=n_estimators, max_depth=8,
                                 random_state=42, class_weight="balanced")
    Xt, Xv, yt, yv = train_test_split(Xb, yb, test_size=0.2, random_state=42)
    clf.fit(Xt, yt)
    acc = accuracy_score(yv, clf.predict(Xv))
    model_accuracies[name] = round(acc * 100, 1)
    print(f"\n── {name} (Accuracy: {acc*100:.1f}%) ──")
    print(classification_report(yv, clf.predict(Xv), zero_division=0))
    return clf

le_stage    = LabelEncoder()
le_sev      = LabelEncoder()
le_osteo    = LabelEncoder()
le_cardio   = LabelEncoder()
le_hormonal = LabelEncoder()
le_repro    = LabelEncoder()

y_stage    = le_stage.fit_transform(df["stage_label"])
y_sev      = le_sev.fit_transform(df["severity_label"])
y_osteo    = le_osteo.fit_transform(df["osteo_label"])
y_cardio   = le_cardio.fit_transform(df["cardio_label"])
y_hormonal = le_hormonal.fit_transform(df["hormonal_label"])
y_repro    = le_repro.fit_transform(df["repro_label"])

clf_stage    = balance_and_train(X, pd.Series(y_stage),    "Menopause Stage")
clf_sev      = balance_and_train(X, pd.Series(y_sev),      "Symptom Severity")
clf_osteo    = balance_and_train(X, pd.Series(y_osteo),    "Osteoporosis Risk")
clf_cardio   = balance_and_train(X, pd.Series(y_cardio),   "Cardiovascular Risk")
clf_hormonal = balance_and_train(X, pd.Series(y_hormonal), "Hormonal Imbalance")
clf_repro    = balance_and_train(X, pd.Series(y_repro),    "Reproductive Profile")

# ─── 13. Save models ─────────────────────────────────────────────────────────
joblib.dump(clf_stage,    f"{MODEL_DIR}/clf_stage.pkl")
joblib.dump(clf_sev,      f"{MODEL_DIR}/clf_severity.pkl")
joblib.dump(clf_osteo,    f"{MODEL_DIR}/clf_osteo.pkl")
joblib.dump(clf_cardio,   f"{MODEL_DIR}/clf_cardio.pkl")
joblib.dump(clf_hormonal, f"{MODEL_DIR}/clf_hormonal.pkl")
joblib.dump(clf_repro,    f"{MODEL_DIR}/clf_repro.pkl")

joblib.dump(le_stage,    f"{MODEL_DIR}/le_stage.pkl")
joblib.dump(le_sev,      f"{MODEL_DIR}/le_severity.pkl")
joblib.dump(le_osteo,    f"{MODEL_DIR}/le_osteo.pkl")
joblib.dump(le_cardio,   f"{MODEL_DIR}/le_cardio.pkl")
joblib.dump(le_hormonal, f"{MODEL_DIR}/le_hormonal.pkl")
joblib.dump(le_repro,    f"{MODEL_DIR}/le_repro.pkl")
joblib.dump(feature_cols, f"{MODEL_DIR}/feature_cols.pkl")

# ─── 14. Save accuracy metrics ───────────────────────────────────────────────
with open(f"{MODEL_DIR}/accuracies.json", "w") as f:
    json.dump(model_accuracies, f, indent=2)
print(f"\nModel Accuracies: {model_accuracies}")

# ─── 15. Save feature importance ─────────────────────────────────────────────
feature_importance = {}
for name, clf in [("Menopause Stage", clf_stage), ("Symptom Severity", clf_sev),
                   ("Osteoporosis Risk", clf_osteo), ("Cardiovascular Risk", clf_cardio),
                   ("Hormonal Imbalance", clf_hormonal), ("Reproductive Profile", clf_repro)]:
    imps = clf.feature_importances_
    top_idx = np.argsort(imps)[::-1][:8]  # top 8 features
    top_features = []
    for idx in top_idx:
        top_features.append({
            "feature": feature_cols[idx],
            "importance": round(float(imps[idx]) * 100, 2)
        })
    feature_importance[name] = top_features

with open(f"{MODEL_DIR}/feature_importance.json", "w") as f:
    json.dump(feature_importance, f, indent=2)

print("\n✅ All models, accuracies & feature importance saved to ./models/")
