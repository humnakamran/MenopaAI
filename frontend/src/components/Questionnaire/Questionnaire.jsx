import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import ProgressFlower from './ProgressFlower'
import StepPersonal from './StepPersonal'
import StepMenstrual from './StepMenstrual'
import StepReproductive from './StepReproductive'
import StepSymptoms from './StepSymptoms'
import StepMedical from './StepMedical'
import StepLifestyle from './StepLifestyle'
import StepScreening from './StepScreening'

const TOTAL_STEPS = 7

const CONDITION_MAP = {
  pcos: 'pcos',
  diabetes: 'diabetes',
  hypertension: 'hypertension',
  thyroid: 'thyroid disorder',
  heart: 'heart disease',
  osteoporosis: 'osteoporosis',
  anemia: 'anemia',
  vitd: 'vitamin D deficiency',
}

const initialData = {
  age: '', height: '', weight: '', province: 'Punjab', _ageError: false,
  menarcheAge: '', cyclePattern: 'regular', menstrualStatus: 'regular periods', earlyMenopause: 'No',
  pregnancies: '', liveBirths: '', miscarriages: '', stillbirth: false, infertility: false, pcosDiagnosis: 'No',
  symptoms: {}, symptomIntensity: 'sometimes',
  conditions: {}, familyHistory: 'none',
  diet: 'Balanced/Mixed diet', physicalActivity: 'Moderate physical work', stressLevel: '2', smoking: false,
  papSmear: 'Within 3 years', mammography: 'Within 2 years', boneDensity: 'Never',
}

export default function Questionnaire({ onSubmit, onBack }) {
  const { t } = useLang()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)
  const [direction, setDirection] = useState(1)

  const update = useCallback((patch) => {
    setData(prev => ({ ...prev, ...patch }))
  }, [])

  const validateStep = (s) => {
    if (s === 1) {
      const age = parseInt(data.age)
      if (!age || age < 18 || age > 80) {
        update({ _ageError: true })
        return false
      }
      update({ _ageError: false })
    }
    return true
  }

  const next = () => {
    if (validateStep(step) && step < TOTAL_STEPS) {
      setDirection(1)
      setStep(s => s + 1)
    }
  }

  const prev = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  const submit = () => {
    if (!validateStep(step)) return
    const intensity = data.symptomIntensity
    const symptomPayload = {}
    const allSymptomKeys = [
      'hot_flashes', 'night_sweats', 'vaginal_dryness', 'pain_intercourse',
      'mood_swings', 'anxiety', 'depression', 'irritability',
      'sleep_disturbances', 'memory_issues', 'joint_pain', 'muscle_pain',
      'fatigue', 'hair_thinning', 'weight_gain_symptom', 'recurrent_uti',
    ]
    allSymptomKeys.forEach(k => {
      symptomPayload[k] = data.symptoms[k] ? intensity : 'never'
    })

    const diagnosesList = Object.entries(data.conditions)
      .filter(([, v]) => v)
      .map(([id]) => CONDITION_MAP[id])
      .filter(Boolean)

    const payload = {
      age: data.age,
      height: data.height,
      weight: data.weight,
      cycle_pattern: data.cyclePattern,
      current_menstrual_status: data.menstrualStatus,
      early_menopause: data.earlyMenopause,
      num_pregnancies: data.pregnancies || '0',
      live_births: data.liveBirths || '0',
      miscarriages: data.miscarriages || '0',
      stillbirth: data.stillbirth ? 'Yes' : 'No',
      infertility_attempt: data.infertility ? 'Yes' : 'No',
      pcos_diagnosis: data.pcosDiagnosis,
      diagnoses: diagnosesList.length ? diagnosesList.join(';') : 'none',
      family_history: data.familyHistory,
      diet: data.diet,
      physical_activity: data.physicalActivity,
      stress_level: data.stressLevel,
      smoking: data.smoking ? 'yes' : 'no',
      tobacco: data.smoking ? 'yes' : 'no',
      ...symptomPayload,
    }
    onSubmit(payload)
  }

  const stepVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <StepPersonal data={data} onChange={update} />
      case 2: return <StepMenstrual data={data} onChange={update} />
      case 3: return <StepReproductive data={data} onChange={update} />
      case 4: return <StepSymptoms data={data} onChange={update} />
      case 5: return <StepMedical data={data} onChange={update} />
      case 6: return <StepLifestyle data={data} onChange={update} />
      case 7: return <StepScreening data={data} onChange={update} />
      default: return null
    }
  }

  return (
    <motion.div
      className="questionnaire"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ProgressFlower currentStep={step} />

      <div className="q-card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="q-nav">
          <button
            className="q-btn q-btn-back"
            onClick={step === 1 ? onBack : prev}
          >
            ← {t('steps', 'back')}
          </button>
          <div style={{ flex: 1 }} />
          {step < TOTAL_STEPS ? (
            <button className="q-btn q-btn-next" onClick={next}>
              {t('steps', 'next')} →
            </button>
          ) : (
            <button className="q-btn q-btn-submit" onClick={submit}>
              ✦ {t('steps', 'submit')}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .questionnaire {
          max-width: 640px;
          margin: 0 auto;
          padding: 40px 24px 60px;
        }
        .q-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-xl);
          padding: 36px 32px 28px;
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(12px);
          overflow: hidden;
        }
        .step-content { min-height: 200px; }
        .step-title {
          font-size: 1.3rem;
          margin-bottom: 6px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--sage-wash);
          color: var(--sage-deep);
        }
        .step-subtitle {
          color: var(--text-muted);
          font-size: 0.92rem;
          margin-bottom: 22px;
        }
        .field {
          display: flex;
          flex-direction: column;
          margin-bottom: 18px;
        }
        .field label {
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--sage-deep);
          margin-bottom: 6px;
        }
        .field input[type="number"],
        .field input[type="text"],
        .field select {
          padding: 11px 14px;
          border: 1.5px solid var(--sage-wash);
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.85);
          font-size: 0.95rem;
          font-family: var(--font-body);
          color: var(--text);
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .field input:focus,
        .field select:focus {
          border-color: var(--terracotta);
          box-shadow: 0 0 0 3px rgba(236,64,122,0.1);
        }
        .field-error {
          color: #c0392b;
          font-size: 0.8rem;
          margin-top: 4px;
        }
        .field-row {
          display: flex;
          gap: 16px;
        }
        .field.half { flex: 1; }
        .bmi-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(244,143,177,0.08), rgba(206,147,216,0.08));
          border-radius: var(--radius-md);
          border: 1px dashed var(--terracotta-light);
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--sage-deep);
        }
        .bmi-badge {
          padding: 3px 12px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }
        .bmi-under { background: #5dade2; }
        .bmi-normal { background: #58d68d; }
        .bmi-over { background: #f0b27a; }
        .bmi-obese { background: #ec7063; }
        .checkbox-field { flex-direction: row; }
        .check-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text);
        }
        .check-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--terracotta);
          cursor: pointer;
        }
        .symptom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        .symptom-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.6);
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.2s var(--ease-out-expo);
          font-weight: 500;
          font-size: 0.88rem;
          color: var(--text);
        }
        .symptom-chip:hover {
          background: rgba(255,255,255,0.9);
          border-color: var(--sage-mist);
        }
        .symptom-chip.active {
          background: rgba(236,64,122,0.07);
          border-color: var(--terracotta);
          color: var(--sage-deep);
        }
        .symptom-chip input { display: none; }
        .symptom-icon { font-size: 1.05rem; }
        .q-nav {
          display: flex;
          align-items: center;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--sage-wash);
        }
        .q-btn {
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 600;
          padding: 10px 24px;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.25s var(--ease-spring);
          border: none;
        }
        .q-btn-back {
          background: transparent;
          color: var(--text-muted);
          border: 1.5px solid var(--sage-wash);
        }
        .q-btn-back:hover {
          border-color: var(--sage-mist);
          color: var(--sage-deep);
        }
        .q-btn-next {
          background: linear-gradient(135deg, var(--terracotta), var(--terracotta-light));
          color: white;
        }
        .q-btn-next:hover {
          background: linear-gradient(135deg, var(--terracotta-dark), var(--terracotta));
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(236,64,122,0.28);
        }
        .q-btn-submit {
          background: linear-gradient(135deg, var(--terracotta), var(--terracotta-dark));
          color: white;
          padding: 12px 28px;
        }
        .q-btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(236,64,122,0.4);
        }
        @media (max-width: 768px) {
          .questionnaire { padding: 24px 16px 40px; }
          .q-card { padding: 24px 20px 20px; }
          .symptom-grid { grid-template-columns: 1fr; }
          .field-row { flex-direction: column; gap: 0; }
        }
      `}</style>
    </motion.div>
  )
}
