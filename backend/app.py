"""
app.py  ─  MenopaAI Flask Backend (Enhanced)
=============================================
Endpoints:
  GET  /                    → health check
  POST /predict             → full ML predictions
  GET  /accuracies          → model accuracy scores
  GET  /feature-importance  → top features per model
  POST /chat                → AI chatbot (context-aware)
"""

import re, os, json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

MODEL_DIR = "models"

# ── Load models ───────────────────────────────────────────────────────────────
clf_stage    = joblib.load(f"{MODEL_DIR}/clf_stage.pkl")
clf_sev      = joblib.load(f"{MODEL_DIR}/clf_severity.pkl")
clf_osteo    = joblib.load(f"{MODEL_DIR}/clf_osteo.pkl")
clf_cardio   = joblib.load(f"{MODEL_DIR}/clf_cardio.pkl")
clf_hormonal = joblib.load(f"{MODEL_DIR}/clf_hormonal.pkl")
clf_repro    = joblib.load(f"{MODEL_DIR}/clf_repro.pkl")

le_stage    = joblib.load(f"{MODEL_DIR}/le_stage.pkl")
le_sev      = joblib.load(f"{MODEL_DIR}/le_severity.pkl")
le_osteo    = joblib.load(f"{MODEL_DIR}/le_osteo.pkl")
le_cardio   = joblib.load(f"{MODEL_DIR}/le_cardio.pkl")
le_hormonal = joblib.load(f"{MODEL_DIR}/le_hormonal.pkl")
le_repro    = joblib.load(f"{MODEL_DIR}/le_repro.pkl")
feature_cols = joblib.load(f"{MODEL_DIR}/feature_cols.pkl")

# ── Load accuracy & feature importance ────────────────────────────────────────
try:
    with open(f"{MODEL_DIR}/accuracies.json") as f:
        model_accuracies = json.load(f)
except:
    model_accuracies = {}

try:
    with open(f"{MODEL_DIR}/feature_importance.json") as f:
        feature_importance_data = json.load(f)
except:
    feature_importance_data = {}

print("✅ Models loaded.")

# ── Helpers ───────────────────────────────────────────────────────────────────
def to_num(s):
    try:
        s2 = re.sub(r"[^\d.]", "", str(s))
        return float(s2) if s2 else np.nan
    except:
        return np.nan

SYMPTOM_COLS = [
    "hot_flashes","night_sweats","vaginal_dryness","pain_intercourse",
    "mood_swings","anxiety","depression","irritability","sleep_disturbances",
    "memory_issues","joint_pain","muscle_pain","fatigue","hair_thinning",
    "weight_gain_symptom","recurrent_uti"
]

freq_score = {"never": 0, "rarely": 1, "sometimes": 1, "often": 1, "severe / daily": 2, "": 0}

def symptom_pts(val):
    v = str(val).strip().lower()
    for k, s in freq_score.items():
        if k in v: return s
    return 0

def encode_freq(val):
    v = str(val).strip().lower()
    if "severe" in v: return 2
    if "often" in v or "sometimes" in v: return 1
    if "rarely" in v: return 0
    return 0

def cycle_enc(s):
    v = str(s).lower()
    if "regular" in v and "irregular" not in v: return 0
    if "irregular" in v: return 1
    if "heavy" in v or "painful" in v: return 2
    return 3

def activity_enc(s):
    v = str(s).lower()
    if "sedentary" in v: return 0
    if "moderate" in v or "light" in v: return 1
    if "heavy" in v or "extreme" in v or "active" in v: return 2
    return 1

def diet_enc(s):
    v = str(s).lower()
    if "fast food" in v or "processed" in v or "high-fat" in v: return 0
    if "balanced" in v or "vegetarian" in v or "high-protein" in v: return 2
    return 1

def stress_enc(s):
    n = to_num(s)
    if np.isnan(n): return 2
    try: return int(n)
    except: return 2

def build_features(d):
    row = {}
    for col in SYMPTOM_COLS:
        row[f"s_{col}"] = encode_freq(d.get(col, "never"))

    sym_score = sum(symptom_pts(d.get(c, "never")) for c in SYMPTOM_COLS)
    row["sym_score"] = sym_score

    age = to_num(d.get("age", 40))
    row["age_f"] = float(age) if not np.isnan(age) else 40.0

    h_raw = to_num(d.get("height", 160))
    h_cm  = float(h_raw) if not np.isnan(h_raw) else 160.0
    if h_cm < 10: h_cm *= 30.48

    w_raw = to_num(d.get("weight", 60))
    w_kg  = float(w_raw) if not np.isnan(w_raw) else 60.0

    bmi = w_kg / (h_cm / 100) ** 2 if h_cm > 0 else 23.0
    row["bmi_f"] = max(10.0, min(60.0, bmi))

    row["cycle_f"]    = cycle_enc(d.get("cycle_pattern", "regular"))
    row["activity_f"] = activity_enc(d.get("physical_activity", "moderate"))
    row["diet_f"]     = diet_enc(d.get("diet", "balanced"))
    row["stress_f"]   = stress_enc(d.get("stress_level", "2"))

    diagnoses   = str(d.get("diagnoses", "")).lower()
    fam_hist    = str(d.get("family_history", "")).lower()
    smoking     = str(d.get("smoking", "no")).lower()
    tobacco     = str(d.get("tobacco", "no")).lower()
    pcos_diag   = str(d.get("pcos_diagnosis", "no")).lower()
    infert      = str(d.get("infertility_attempt", "no")).lower()
    early_meno  = str(d.get("early_menopause", "no")).lower()

    row["has_diabetes"]  = 1 if "diabetes" in diagnoses else 0
    row["has_htn"]       = 1 if "hypertension" in diagnoses else 0
    row["has_thyroid"]   = 1 if "thyroid" in diagnoses else 0
    row["has_anemia"]    = 1 if "anemia" in diagnoses else 0
    row["has_vitd"]      = 1 if "vitamin d" in diagnoses else 0
    row["has_heart"]     = 1 if "heart" in diagnoses else 0
    row["has_osteo"]     = 1 if "osteoporosis" in diagnoses else 0
    row["smokes"]        = 1 if smoking in ["yes","current","former"] else 0
    row["tobacco_use"]   = 0 if tobacco in ["no","never",""] else 1
    row["pcos_flag"]     = 1 if any(x in pcos_diag for x in ["yes","suspected","confirmed"]) else 0
    row["infert_flag"]   = 1 if "yes" in infert else 0
    row["early_meno_f"]  = 1 if "yes" in early_meno else 0
    row["fam_osteo"]     = 1 if "osteoporosis" in fam_hist else 0
    row["fam_cardio"]    = 1 if any(x in fam_hist for x in ["heart","cardiovascular"]) else 0
    row["fam_diabetes"]  = 1 if "diabetes" in fam_hist else 0

    X = pd.DataFrame([row])[feature_cols].fillna(0)
    return X, sym_score

def risk_to_pct(level):
    return {"Low": 25, "Medium": 60, "High": 90}.get(level, 25)

# ── NLP Chatbot Engine ────────────────────────────────────────────────────────
FAQ_DATA = [
    # General Menopause
    ("What is menopause?", "Menopause is defined as going 12 consecutive months without a menstrual period. It typically occurs between ages 45 and 55, driven by a natural decline in reproductive hormones (estrogen and progesterone)."),
    ("What is perimenopause?", "Perimenopause is the transitional phase leading up to menopause. It can last anywhere from 2 to 10 years. You may experience irregular periods, hot flashes, mood swings, and sleep issues as your hormone levels fluctuate."),
    ("How long do menopause symptoms last?", "On average, women experience menopause symptoms for 4 to 5 years, but they can last up to 10 years or more for some. Hormone Replacement Therapy (HRT) and lifestyle changes can significantly manage the duration and severity."),
    
    # Vasomotor Symptoms (Hot Flashes, Night Sweats)
    ("What helps with hot flashes?", "For hot flashes: dress in breathable layers, keep your bedroom cool, avoid triggers like caffeine, alcohol, and spicy foods, and practice deep breathing pacing. If severe, HRT or certain non-hormonal medications (like Gabapentin or SSRIs) can be highly effective."),
    ("I wake up sweating every night. What should I do for night sweats?", "Night sweats are severe hot flashes during sleep. Keep room temperature low, use moisture-wicking pajamas and cooling mattress pads. Avoiding heavy meals and alcohol before bed also helps. Medical options include estrogen therapy or low-dose antidepressants."),
    
    # Psychological & Cognitive
    ("Why am I so moody and irritable?", "Mood swings, irritability, and unprovoked anger are very common during perimenopause due to rapid estrogen fluctuations affecting your brain's serotonin levels. Exercise, stress management, and sometimes HRT or antidepressants are used for treatment."),
    ("I feel depressed and anxious lately.", "Hormone transitions are a known risk factor for increased anxiety and depressive episodes. It's crucial to speak with a healthcare provider. Therapy, SSRIs, and HRT have all been shown to relieve menopause-related depression."),
    ("I have brain fog and can't remember things.", "Menopausal 'brain fog' includes difficulty concentrating, misplacing items, and forgetfulness. It is temporary and related to estrogen shifts and poor sleep. Good sleep hygiene, omega-3s, and cognitive exercises help. It usually improves post-menopause."),
    
    # Physical & Urogenital
    ("My joints and muscles ache constantly.", "Estrogen reduces inflammation; as it drops, many women develop joint pain (arthralgia) and muscle stiffness, especially in the mornings. Gentle movement (yoga, swimming), anti-inflammatory diets, and weight maintenance are the best defenses."),
    ("Why do I have vaginal dryness and pain during intimacy?", "Dropping estrogen thins and dries the vaginal tissues (Genitourinary Syndrome of Menopause). You can use over-the-counter vaginal moisturizers (applied regularly) and lubricants (during intimacy). For better relief, localized vaginal estrogen creams/tablets are very safe and effective."),
    ("I keep getting UTIs. Is this normal?", "Yes, recurrent Urinary Tract Infections (UTIs) are common after menopause because thinning tissues make the urethra more vulnerable to bacteria. Localized vaginal estrogen is the most effective preventative treatment. Stay hydrated and confidentially discuss this with your doctor."),
    
    # Sleep & Fatigue
    ("I can't sleep through the night. I have insomnia.", "Sleep disturbances are triggered by night sweats, anxiety, and just the hormonal shift itself. Practice excellent sleep hygiene: dark, cool room, no screens 1 hour before bed, and waking up at the same time daily. Magnesium glycinate before bed may also help."),
    ("I feel exhausted and fatigued all the time.", "Fatigue is common due to poor sleep (night sweats) and the body adjusting to new hormone levels. Focus on an energy-stabilizing diet (high protein, low sugar), stay hydrated, and ensure you aren't deficient in Iron, Vitamin D, or B12."),
    
    # Appearance (Weight, Hair, Skin)
    ("Why am I gaining belly fat despite no diet change?", "Hormonal changes slow your metabolism and shift fat storage primarily to the abdomen (visceral fat). Combating this requires a slight reduction in calories, increasing protein intake, and shifting focus from just cardio to heavy strength/resistance training to build muscle."),
    ("My hair is thinning and falling out.", "Dropping estrogen/progesterone relative to testosterone can cause androgenic hair thinning. Ensure a diet rich in protein, iron, zinc, and biotin. A dermatologist can prescribe topical minoxidil or other hair-retention medications."),
    ("My skin is dry and losing elasticity.", "Estrogen is crucial for collagen production. Its loss leads to thinner, drier skin. Use heavier, ceramide-rich moisturizers, daily sunscreen, and consider retinoids for elasticity. HRT can also halt some skin thinning."),

    # Risks (Bone & Heart)
    ("How do I prevent osteoporosis?", "Osteoporosis risk skyrockets after menopause. To protect your bones: consume 1200mg of Calcium daily, ensure adequate Vitamin D (consider supplements), and perform weight-bearing exercises (walking, dancing, lifting weights). Ask your doctor for a DEXA bone density scan."),
    ("What are the heart disease risks after menopause?", "Before menopause, estrogen protects your heart. After, your risk of cardiovascular disease catches up to men's. Protect your heart by monitoring your blood pressure and cholesterol, eating a Mediterranean diet, quitting smoking, and exercising 150 minutes a week."),
    
    # Menstrual Irregularities & PCOS
    ("My periods are very heavy and painful now.", "During perimenopause, erratic ovulation can lead to very heavy or prolonged bleeding. While common, you should *always* get heavy, unusually painful, or prolonged bleeding checked by a gynecologist to rule out fibroids, polyps, or uterine issues."),
    ("What happens to PCOS after menopause?", "While periods stop, the metabolic components of PCOS (insulin resistance, risk of diabetes, and high cholesterol) continue and often worsen. You must maintain a healthy lifestyle and continue monitoring your blood sugar and lipids."),
    
    # Treatments (HRT, Supplements, Diet)
    ("What is HRT and is it safe?", "Hormone Replacement Therapy (HRT) involves taking estrogen and progesterone to replace what your ovaries no longer make. For most healthy women under 60 (or within 10 years of menopause), the benefits of HRT (symptom relief, bone/heart protection) significantly outweigh the risks. Discuss your personal family history with your doctor."),
    ("What are natural alternatives to HRT?", "Non-hormonal options include: phytoestrogens (soy, flaxseed), black cohosh (for mild hot flashes), SSRIs/SNRIs (prescription meds for hot flashes/mood), calcium/vitamin D, and cognitive behavioral therapy for insomnia."),
    ("What is the best diet for menopause?", "The Mediterranean diet is highly recommended: rich in vegetables, fruits, whole grains, beans, nuts, healthy fats (olive oil, avocado), and lean protein (fish, poultry). Reduce refined sugars, ultra-processed foods, excess caffeine, and sodium."),
    ("What exercises are best?", "A combination is required: 1) Strength/Resistance training (2-3 times/week) to preserve muscle and boost metabolism, 2) Weight-bearing cardio (walking/jogging) for bone density, and 3) Yoga/pilates for flexibility and stress reduction."),
    
    # Urdu/Hindustani common phrases
    ("dard takleef pain", "Menopause ke dauran joron aur pathon mein dard (joint and muscle pain) bohat aam hai. Yeh estrogen ki kami ki wajah se hota hai. Rozana halki warzish (exercise) aur calcium/vitamin D ka istemaal is mein madad de sakta hai."),
    ("hayz periods menses band", "Irregular periods ya unka poori tarah band ho jana menopause ki pehli nishani hai. Agar aapko 12 mahinay se periods nahi aaye, toh aap post-menopause mein hain. Phir bhi saal mein ek baar gynecologist ko zaroor dikhayen."),
    ("garmi paseena hot flashes", "Garmi ki lehren (hot flashes) aur raat ko paseena aana hormonal tabdeeli ki wajah se hai. Thanday kamray mein soyen, sooti (cotton) libaas pehnen aur masalay daar khano se parhez karein. Zyada takleef ho toh doctor se HRT ke baare mein baat karein."),
    ("vazan weight obesity", "Menopause mein wazan barhna, khaas tor par pait ke ird-gird, aam baat hai. Metabolism slow ho jata hai. Isay roknay ke liye apni khuraak mein protein zyada karein aur meethi/processed cheezon se parhez karein."),
]

# Unpack FAQ data
FAQ_QUESTIONS = [item[0] for item in FAQ_DATA]
FAQ_ANSWERS   = [item[1] for item in FAQ_DATA]

# Initialize TF-IDF Vectorizer to learn the vocabulary of our questions
vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
faq_vectors = vectorizer.fit_transform(FAQ_QUESTIONS)

def get_chatbot_response(message, predictions=None):
    msg_lower = message.lower()

    # 1. Context-aware personalized overrides
    if predictions and any(q in msg_lower for q in ["my results", "what does it mean", "explain my", "what is my", "summary", "report"]):
        stage = predictions.get("stage_prediction", "")
        severity = predictions.get("symptom_severity", "")
        osteo = predictions.get("osteoporosis_risk", "")
        cardio = predictions.get("cardiovascular_risk", "")
        hormonal = predictions.get("hormonal_imbalance", "")

        return (f"Based on your assessment:\n• You are in the **{stage}** stage.\n"
                f"• Your symptom severity is **{severity}**.\n"
                f"• Osteoporosis risk: **{osteo}** | Cardiovascular risk: **{cardio}**\n"
                f"• Hormonal Imbalance check: **{hormonal}**\n\n"
                f"You can ask me specific questions like 'How do I prevent osteoporosis?' or 'What helps with hot flashes?' for detailed advice!")

    # 2. Greeting/chit-chat
    if message.strip().lower() in ["hello", "hi", "salam", "hey", "help", "start"]:
        return "Salam! 🌸 I am the enhanced MenopaAI assistant. I can answer questions about menopause symptoms, HRT, bone & heart health, diet, and explain your personalized results. What's on your mind?"

    # 3. NLP Semantic Matching (TF-IDF + Cosine Similarity)
    # Vectorize the user's message
    user_vec = vectorizer.transform([message])
    
    # Calculate cosine similarity against all known FAQ questions
    similarities = cosine_similarity(user_vec, faq_vectors).flatten()
    
    # Find the best match
    best_idx = np.argmax(similarities)
    best_score = similarities[best_idx]

    # Threshold for understanding (if score is too low, we didn't understand)
    if best_score > 0.15:
        return FAQ_ANSWERS[best_idx]
    
    # 4. Fallback if semantic match fails
    return ("I'm not completely sure about that. 🌸 As your Menopause AI assistant, I can best answer questions about:\n"
            "• Hot flashes, sleep, and mood changes\n"
            "• Bone (Osteoporosis) and Heart health\n"
            "• Weight gain, diet, and exercise\n"
            "• HRT (Hormone Replacement Therapy) and alternatives\n"
            "• Explaining your personal assessment results\n"
            "Could you try rephrasing your question?")


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "MenopaAI backend running ✅", "models": len(le_stage.classes_)})


@app.route("/accuracies", methods=["GET"])
def get_accuracies():
    return jsonify(model_accuracies)


@app.route("/feature-importance", methods=["GET"])
def get_feature_importance():
    model_name = request.args.get("model", "Menopause Stage")
    data = feature_importance_data.get(model_name, [])
    # Make feature names human-readable
    readable = []
    label_map = {
        "age_f": "Age", "bmi_f": "BMI", "sym_score": "Total Symptom Score",
        "cycle_f": "Cycle Pattern", "activity_f": "Physical Activity",
        "diet_f": "Diet Quality", "stress_f": "Stress Level",
        "s_hot_flashes": "Hot Flashes", "s_night_sweats": "Night Sweats",
        "s_mood_swings": "Mood Swings", "s_sleep_disturbances": "Sleep Issues",
        "s_vaginal_dryness": "Vaginal Dryness", "s_anxiety": "Anxiety",
        "s_depression": "Depression", "s_fatigue": "Fatigue",
        "s_joint_pain": "Joint Pain", "s_memory_issues": "Memory Issues",
        "s_hair_thinning": "Hair Thinning", "s_weight_gain_symptom": "Weight Gain",
        "has_diabetes": "Diabetes Diagnosis", "has_htn": "Hypertension",
        "has_thyroid": "Thyroid Condition", "has_osteo": "Osteoporosis Dx",
        "has_heart": "Heart Disease", "pcos_flag": "PCOS",
        "infert_flag": "Infertility History", "early_meno_f": "Early Menopause",
        "fam_osteo": "Family: Osteoporosis", "fam_cardio": "Family: Heart Disease",
        "fam_diabetes": "Family: Diabetes", "smokes": "Smoking"
    }
    for item in data:
        readable.append({
            "feature": label_map.get(item["feature"], item["feature"].replace("s_","").replace("_"," ").title()),
            "importance": item["importance"]
        })
    return jsonify(readable)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        X, sym_score = build_features(data)

        stage    = le_stage.inverse_transform(clf_stage.predict(X))[0]
        severity = le_sev.inverse_transform(clf_sev.predict(X))[0]
        osteo    = le_osteo.inverse_transform(clf_osteo.predict(X))[0]
        cardio   = le_cardio.inverse_transform(clf_cardio.predict(X))[0]
        hormonal = le_hormonal.inverse_transform(clf_hormonal.predict(X))[0]
        repro    = le_repro.inverse_transform(clf_repro.predict(X))[0]

        # Probabilities
        stage_proba   = clf_stage.predict_proba(X)[0]
        stage_classes = le_stage.classes_
        stage_conf    = {cls: round(float(p)*100, 1) for cls, p in zip(stage_classes, stage_proba)}

        # Symptom radar data (scores per category 0–2)
        radar_data = {
            "Vasomotor":     max(encode_freq(data.get("hot_flashes","never")), encode_freq(data.get("night_sweats","never"))),
            "Psychological": max(encode_freq(data.get("mood_swings","never")), encode_freq(data.get("anxiety","never")), encode_freq(data.get("depression","never"))),
            "Physical":      max(encode_freq(data.get("joint_pain","never")), encode_freq(data.get("fatigue","never"))),
            "Cognitive":     encode_freq(data.get("memory_issues","never")),
            "Urogenital":    max(encode_freq(data.get("vaginal_dryness","never")), encode_freq(data.get("recurrent_uti","never"))),
            "Appearance":    max(encode_freq(data.get("hair_thinning","never")), encode_freq(data.get("weight_gain_symptom","never")))
        }

        # Recommendations
        recs = []
        if osteo in ["Medium", "High"]:
            recs.append({"emoji":"🦴","title":"Bone Health","text":"Increase calcium (1200 mg/day) & Vitamin D. Add weight-bearing exercises."})
        if cardio in ["Medium", "High"]:
            recs.append({"emoji":"❤️","title":"Heart Health","text":"Adopt a low-sodium diet, manage stress, and get regular cardio exercise."})
        if "Post" in stage:
            recs.append({"emoji":"👩‍⚕️","title":"Screening","text":"Schedule a mammogram and bone density (DEXA) scan annually."})
        if hormonal == "Yes":
            recs.append({"emoji":"🔬","title":"Hormonal Check","text":"Consult a gynecologist for FSH, LH, and estradiol panel testing."})
        if severity == "Severe":
            recs.append({"emoji":"💊","title":"Symptom Relief","text":"Severe symptoms detected — speak with your doctor about management options."})
        if "Peri" in stage:
            recs.append({"emoji":"📅","title":"Track Cycles","text":"Keep a symptom diary to help your doctor understand your transition."})
        if not recs:
            recs.append({"emoji":"🥗","title":"Maintain Wellness","text":"Great indicators! Keep up balanced nutrition, regular activity, and annual check-ups."})

        result = {
            "status": "success",
            "stage_prediction":    stage,
            "stage_confidence":    stage_conf,
            "symptom_severity":    severity,
            "symptom_score":       int(sym_score),
            "osteoporosis_risk":   osteo,
            "cardiovascular_risk": cardio,
            "hormonal_imbalance":  hormonal,
            "repro_profile":       repro,
            "osteo_pct":           risk_to_pct(osteo),
            "cardio_pct":          risk_to_pct(cardio),
            "radar_data":          radar_data,
            "recommendations":     recs,
            "model_accuracies":    model_accuracies
        }
        return jsonify(result)

    except Exception as e:
        import traceback
        return jsonify({"status": "error", "message": str(e),
                        "trace": traceback.format_exc()}), 500


@app.route("/chat", methods=["POST"])
def chat():
    try:
        body = request.get_json(force=True)
        message     = body.get("message", "")
        predictions = body.get("predictions", None)
        response    = get_chatbot_response(message, predictions)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"response": "Sorry, I encountered an error. Please try again."})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
