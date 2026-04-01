<div align="center">

# 🌸 MenopaAI 
**An AI-Powered Advanced Health Assessment Platform**

[![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask&logoColor=white)](#)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-Machine%20Learning-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)](#)
[![HTML/CSS/JS](https://img.shields.io/badge/Vanilla-Frontend-yellow?style=for-the-badge&logo=javascript&logoColor=white)](#)

*Predicting, tracking, and understanding reproductive health, menopause stages, and associated risks through Machine Learning and advanced UI/UX.*

</div>

---

## 🌟 Overview
**MenopaAI** is a comprehensive diagnostic health platform designed to help women navigate the complexities of perimenopause, menopause, and associated reproductive syndromes (like PCOS). By taking a quick but detailed symptom and lifestyle questionnaire, users receive an **AI-generated personalized health profile.**

The platform features six specialized Random Forest Machine Learning models trained on augmented, medically coherent symptom datasets to provide high-accuracy risk assessments.

---

## ✨ Key Features

- **🤖 6-Model AI Prediction Engine:** Accurately forecasts Menopause Stage, Symptom Severity, Osteoporosis Risk, Cardiovascular Risk, and Hormonal Imbalance.
- **💬 Context-Aware AI Chatbot:** An integrated NLP-powered assistant that understands your personal test results and can answer dozens of questions regarding menopause, symptom management, and treatments.
- **📊 Dynamic Visualizations:** Uses Chart.js to render beautiful Symptom Radar capabilities (Psychological, Vasomotor, Physical, etc.) and line charts summarizing historical trends.
- **📄 Instant PDF Reports:** Generate and download a beautifully formatted, lossless PDF of your entire personalized health dashboard locally.
- **🌐 Localization:** Features an instant Urdu / English toggle, translating the complex questionnaire and medical advice for South Asian demographics. 
- **📈 Explainable AI:** View the inner workings of the Random Forest models by looking at the Feature Importance rankings for your specific predictions.
- **🔬 Data Augmentation Pipeline:** Includes a custom script that generated a robust 500-sample dataset, strictly respecting original medical distributions and constraints (e.g. preventing post-menopausal pregnancies).

---

## 🛠️ Technology Stack

| Architecture | Technologies |
| :--- | :--- |
| **Backend** | Python 3.12, Flask, Flask-CORS |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, NLP (TF-IDF & Cosine Similarity) |
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Glassmorphism) |
| **Libraries** | Chart.js, HTML2Canvas, jsPDF |

---

## 📂 Project Structure

```text
menopause-app/
│
├── backend/                  # 🟢 Python Server & AI Models
│   ├── app.py                # Main Flask API and Chatbot logic
│   ├── train_model.py        # ML Training and Model Export script
│   ├── augment_data.py       # Algorithmic synthetic data generator
│   └── models/               # Serialized .pkl models and accuracy arrays
│
├── frontend/                 # 🔵 Client-side UI
│   ├── index.html            # Main website entry point
│   ├── script.js             # UI manipulation and API fetch logic
│   ├── styles.css            # Advanced animations and styling
│   └── assets/               # Local imagery and assets
│
└── data/                     # 🟡 Datasets
    └── synthetic_augmented_data.csv 
```

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.10+
- A modern web browser (Chrome, Firefox, Safari)

### 1. Start the Backend API
Open your terminal and navigate to the project root:
```bash
# Navigate to the backend directory
cd backend

# Install the required dependencies (pandas, scikit-learn, flask, etc.)
pip install -r requirements.txt

# Start the Flask server
python app.py
```
*The backend should now be listening on port 5000.*

### 2. Launch the Frontend
Because the frontend uses vanilla HTML/JS, no Node.js servers are required.
- Simply navigate to the `frontend/` folder.
- Double-click **`index.html`** to open it directly in your web browser. 

---

## 🧠 Retraining the AI Models
If you obtain more authentic survey data, you can easily retrain the models:
1. Place your data in the `data/` folder.
2. Update the target rows inside `backend/augment_data.py` and run it.
3. Run `python backend/train_model.py`. The `models/` directory, accuracy arrays, and feature importance dictionaries will automatically regenerate.

---
<div align="center">
<i>Built with ❤️ to empower women's health through Artificial Intelligence.</i>
</div>
