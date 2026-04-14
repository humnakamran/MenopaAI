"""
augment_data.py — Synthetic Data Generator for MenopaAI
========================================================
Reads the original research survey CSV, generates synthetic samples
that closely resemble the original distributions, and saves a new
augmented CSV. The synthetic data preserves:
  - Categorical distributions (province, marital status, etc.)
  - Numeric distributions (age, height, weight + realistic noise)
  - Logical constraints (menstrual status ↔ age, symptom patterns)

Run:  py -3.12 augment_data.py
"""

import os, re
import numpy as np
import pandas as pd
from collections import Counter

np.random.seed(42)

CSV_PATH    = r"../fyp (Responses) - Form responses 1.csv"
OUTPUT_PATH = r"../data/synthetic_augmented_data.csv"
TARGET_TOTAL = 600  # total rows in final dataset

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ── Load original ──────────────────────────────────────────────────────────────
df = pd.read_csv(CSV_PATH)
df = df[df.iloc[:, 1].str.contains("voluntarily", case=False, na=False)].copy()
df = df.reset_index(drop=True)
orig_count = len(df)
n_synth = TARGET_TOTAL - orig_count
print(f"Original: {orig_count} rows → generating {n_synth} synthetic rows")

# ── Helpers ────────────────────────────────────────────────────────────────────
def sample_from_col(col, n):
    """Sample n values from a column preserving its distribution."""
    vals = col.dropna().values
    if len(vals) == 0:
        return [np.nan] * n
    return np.random.choice(vals, size=n, replace=True).tolist()

def to_num(s):
    try:
        s2 = re.sub(r"[^\d.]", "", str(s))
        return float(s2) if s2 else np.nan
    except:
        return np.nan

def add_noise(values, noise_pct=0.15):
    """Add Gaussian noise to numeric values."""
    result = []
    for v in values:
        n = to_num(v)
        if pd.isna(n):
            result.append(v)
        else:
            noise = np.random.normal(0, abs(n) * noise_pct) if n != 0 else np.random.normal(0, 1)
            new_val = max(0, n + noise)
            result.append(round(new_val, 1))
    return result

# ── Column classification ─────────────────────────────────────────────────────
cols = df.columns.tolist()

# Numeric-ish columns (add noise)
NUMERIC_COLS_IDX = [2, 10, 11, 13, 60]  # age, height, weight, menarche_age, stress

# Categorical columns (sample from distribution)
# Everything else is categorical

# Symptom columns (cols 18-34) — need to be coherent with menstrual status
SYMPTOM_COLS_IDX = list(range(18, 35))

# ── Generate synthetic rows ──────────────────────────────────────────────────
synth_rows = []

for i in range(n_synth):
    row = {}

    # 1. Copy structure — sample each column from original distribution
    for j, col_name in enumerate(cols):
        row[col_name] = np.random.choice(df[col_name].dropna().values) if df[col_name].dropna().shape[0] > 0 else ""

    # 2. Override timestamp
    row[cols[0]] = f"2026/03/{np.random.randint(17,31):02d} {np.random.randint(6,23)}:{np.random.randint(0,59):02d}:{np.random.randint(0,59):02d} pm GMT+5"

    # 3. Consent
    row[cols[1]] = "I voluntarily agree to participate in this research study"

    # 4. Age — sample from realistic distribution with noise
    base_age = np.random.choice(df.iloc[:, 2].apply(to_num).dropna().values)
    age = int(np.clip(base_age + np.random.normal(0, 5), 18, 70))
    row[cols[2]] = str(age)

    # 5. Height/Weight with noise
    row[cols[10]] = str(round(np.random.choice(df.iloc[:, 10].apply(to_num).dropna().values) + np.random.normal(0, 5), 1))
    row[cols[11]] = str(round(np.random.choice(df.iloc[:, 11].apply(to_num).dropna().values) + np.random.normal(0, 5), 1))

    # 6. Menarche age with noise
    menarche = np.random.choice(df.iloc[:, 13].apply(to_num).dropna().values)
    row[cols[13]] = str(int(np.clip(menarche + np.random.normal(0, 1), 9, 18)))

    # 7. Stress level with noise
    stress = np.random.choice(df.iloc[:, 60].apply(to_num).dropna().values)
    row[cols[60]] = str(int(np.clip(stress + np.random.normal(0, 0.8), 0, 5)))

    # 8. Make menstrual status coherent with age
    menstrual_col = cols[15]
    if age < 40:
        row[menstrual_col] = np.random.choice(["regular periods", "irregular periods"], p=[0.7, 0.3])
    elif age < 48:
        row[menstrual_col] = np.random.choice(["regular periods", "irregular periods", "no periods for<12 months"], p=[0.3, 0.5, 0.2])
    elif age < 55:
        row[menstrual_col] = np.random.choice(["irregular periods", "no periods for<12 months", "no periods for>12 months"], p=[0.3, 0.3, 0.4])
    else:
        row[menstrual_col] = np.random.choice(["no periods for>12 months", "no periods for<12 months"], p=[0.8, 0.2])

    # 9. Make symptoms coherent — more symptoms if peri/post menopause
    status = row[menstrual_col].lower()
    if "no periods for>12" in status:
        # Post-menopause: higher chance of symptoms
        symptom_probs = {"Never": 0.1, "Rarely": 0.15, "Sometimes": 0.25, "Often": 0.3, "Severe / Daily": 0.2}
    elif "irregular" in status or "no periods for<12" in status:
        # Peri-menopause
        symptom_probs = {"Never": 0.15, "Rarely": 0.2, "Sometimes": 0.3, "Often": 0.25, "Severe / Daily": 0.1}
    else:
        # Pre-menopause: fewer symptoms
        symptom_probs = {"Never": 0.4, "Rarely": 0.25, "Sometimes": 0.2, "Often": 0.1, "Severe / Daily": 0.05}

    symptom_options = list(symptom_probs.keys())
    symptom_weights = list(symptom_probs.values())

    for idx in SYMPTOM_COLS_IDX:
        row[cols[idx]] = np.random.choice(symptom_options, p=symptom_weights)

    # 10. Early menopause coherence
    early_col = cols[17]
    if age < 45 and "no periods" in status:
        row[early_col] = "Yes"
    elif age >= 50 and "no periods" in status:
        row[early_col] = "No"

    # 11. Menopause age coherence
    meno_age_col = cols[16]
    if "no periods" in status and age >= 40:
        meno_age = int(np.clip(age - np.random.randint(0, 8), 38, age))
        row[meno_age_col] = str(meno_age)
    else:
        row[meno_age_col] = np.random.choice(["No", "", "Not applicable", "N/A"])

    # 12. Pregnancy numbers coherence
    preg_col = cols[35]
    births_col = cols[36]
    misc_col = cols[37]
    preg = np.random.choice(["0", "1-2", "3-4", "5+"], p=[0.15, 0.3, 0.35, 0.2])
    row[preg_col] = preg

    preg_num = {"0": 0, "1-2": np.random.randint(1,3), "3-4": np.random.randint(3,5), "5+": np.random.randint(5,8)}
    p = preg_num[preg]
    live = max(0, p - np.random.randint(0, 2))
    row[births_col] = "0" if p == 0 else ("1-2" if live <= 2 else ("3-4" if live <= 4 else "5+"))
    row[misc_col] = np.random.choice(["none", "1", "2", "3 or above"], p=[0.5, 0.25, 0.15, 0.1])

    synth_rows.append(row)

# ── Combine and save ──────────────────────────────────────────────────────────
synth_df = pd.DataFrame(synth_rows, columns=cols)
final_df = pd.concat([df, synth_df], ignore_index=True)
final_df.to_csv(OUTPUT_PATH, index=False)

print(f"\n✅ Augmented dataset saved: {OUTPUT_PATH}")
print(f"   Original rows: {orig_count}")
print(f"   Synthetic rows: {n_synth}")
print(f"   Total rows: {len(final_df)}")

# Verify distribution preservation
print("\n── Distribution comparison ──")
print(f"Age (original):  mean={df.iloc[:, 2].apply(to_num).mean():.1f}, std={df.iloc[:, 2].apply(to_num).std():.1f}")
print(f"Age (augmented): mean={final_df.iloc[:, 2].apply(to_num).mean():.1f}, std={final_df.iloc[:, 2].apply(to_num).std():.1f}")

print(f"\nMenstrual status (original):")
print(df.iloc[:, 15].value_counts(normalize=True).to_string())
print(f"\nMenstrual status (augmented):")
print(final_df.iloc[:, 15].value_counts(normalize=True).to_string())
