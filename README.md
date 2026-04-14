<div align="center">

# 🌸 MenopaAI
**An AI-Powered Advanced Health Assessment Platform**

[![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask&logoColor=white)](#)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-ML-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)

*Predicting, tracking, and understanding reproductive health, menopause stages, and associated risks through Machine Learning.*

</div>

---

## 🌟 Overview

**MenopaAI** is a comprehensive diagnostic health platform designed to help women navigate the complexities of perimenopause, menopause, and associated reproductive syndromes (like PCOS). By completing a detailed symptom and lifestyle questionnaire, users receive an **AI-generated personalized health profile.**

The platform features six specialized Random Forest Machine Learning models trained on augmented, medically coherent symptom datasets to provide high-accuracy risk assessments.

---

## ✨ Key Features

- **🤖 6-Model AI Prediction Engine** — Forecasts Menopause Stage, Symptom Severity, Osteoporosis Risk, Cardiovascular Risk, Hormonal Imbalance, and Reproductive Health
- **💬 Context-Aware AI Chatbot** — NLP-powered assistant that understands your personal test results using TF-IDF & Cosine Similarity
- **📊 Dynamic Visualizations** — Recharts-powered radar charts, trend lines, and risk breakdowns
- **🌐 Bilingual Support** — Instant Urdu / English toggle for South Asian demographics
- **📈 Explainable AI** — Feature importance rankings showing what drove each prediction
- **🔬 Data Augmentation Pipeline** — Custom script generating a robust 500-sample dataset respecting medical distributions

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.12, Flask, Flask-CORS |
| **Machine Learning** | Scikit-learn 1.4, Pandas, NumPy, Joblib |
| **Frontend** | React 18, Vite 5, Framer Motion |
| **Charts & UI** | Recharts, html2canvas, jsPDF |

---

## 📂 Project Structure

```
MenopaAi/
│
├── backend/                        # Flask API & ML models
│   ├── app.py                      # Main Flask server & chatbot logic
│   ├── train_model.py              # Model training & export script
│   ├── augment_data.py             # Synthetic data generator
│   ├── requirements.txt            # Python dependencies
│   └── models/                     # Serialized .pkl models & JSON outputs
│       ├── clf_stage.pkl
│       ├── clf_severity.pkl
│       ├── clf_cardio.pkl
│       ├── clf_hormonal.pkl
│       ├── clf_osteo.pkl
│       ├── clf_repro.pkl
│       ├── feature_cols.pkl
│       ├── accuracies.json
│       └── feature_importance.json
│
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                 # Root component & routing
│   │   ├── main.jsx                # Entry point
│   │   ├── api.js                  # Axios/fetch API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── BreathingScreen.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Questionnaire/      # Multi-step form (7 steps)
│   │   │   └── Results/            # Dashboard cards
│   │   ├── context/
│   │   │   └── LanguageContext.jsx # Urdu/English toggle
│   │   └── styles/
│   │       ├── global.css
│   │       └── animations.css
│   ├── package.json
│   └── vite.config.js
│
├── fyp (Responses) - Form responses 1.csv   # Original survey data
└── README.md
```

---

## 🚀 Running from Scratch

### Prerequisites

| Tool | Version | Install |
| :--- | :--- | :--- |
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Comes with Node.js |

---

### Step 1 — Clone the Repository

```bash
git clone git@github.com:khubaib-ctrl/Menopa-AI.git
cd Menopa-AI
```

---

### Step 2 — Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# Create and activate a virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend will start at **`http://localhost:5000`**

> **Note:** The trained model files are already included in `backend/models/`. You do **not** need to retrain unless you have new data.

---

### Step 3 — Set Up the Frontend

Open a **new terminal tab/window** (keep the backend running):

```bash
# From the project root, navigate to the frontend
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start at **`http://localhost:5173`**

Open your browser and go to **[http://localhost:5173](http://localhost:5173)**

---

### Step 4 — Using the App

1. Fill in the **multi-step health questionnaire** (personal info, symptoms, lifestyle, etc.)
2. Submit to receive your **AI-generated health dashboard**
3. Explore risk scores, radar charts, and feature importance
4. Use the **chatbot** to ask follow-up questions about your results
5. Toggle **Urdu/English** using the language switch in the navbar

---

## 🧠 Retraining the AI Models (Optional)

Only needed if you have new survey data:

```bash
# 1. Place your new CSV data in the data/ folder

# 2. Regenerate the augmented dataset (edit target rows in the script first)
python backend/augment_data.py

# 3. Retrain all 6 models — overwrites models/ directory automatically
python backend/train_model.py
```

---

## 🔧 Building for Production

```bash
# Build the frontend for deployment
cd frontend
npm run build
# Output will be in frontend/dist/
```

---

## 📋 Environment Notes

- The Flask backend runs on port **5000** by default
- The Vite frontend proxies API calls to `http://localhost:5000`
- CORS is enabled on the backend for local development
- No database is required — all predictions are stateless

---

<div align="center">
<i>Built with ❤️ to empower women's health through Artificial Intelligence.</i>
</div>
