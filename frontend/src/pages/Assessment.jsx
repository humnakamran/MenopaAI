import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictHealth } from '../api'
import Navbar from '../components/Navbar'
import styles from './Assessment.module.css'

const SECTIONS = [
  {
    id: 'demographics',
    label: 'Demographics',
    color: 'baby-pink',
    questions: [
      {
        id: 'age_group',
        type: 'options',
        text: 'What is your age group?',
        sub: 'Age is the primary factor in determining your menopausal stage.',
        options: [
          { label: 'Under 35', desc: 'Pre-reproductive or early reproductive phase' },
          { label: '35 – 44', desc: 'Late reproductive, perimenopause may begin' },
          { label: '45 – 54', desc: 'Most common age for menopausal transition' },
          { label: '55 and above', desc: 'Likely in postmenopause phase' },
        ],
      },
      {
        id: 'bmi',
        type: 'inputs',
        text: 'Basic measurements',
        sub: 'Used to calculate BMI and assess cardiovascular risk factors.',
        fields: [
          { id: 'height', label: 'Height (cm)', placeholder: 'e.g. 158' },
          { id: 'weight', label: 'Weight (kg)', placeholder: 'e.g. 65' },
        ],
      },
    ],
  },
  {
    id: 'menstrual',
    label: 'Menstrual history',
    color: 'baby-pink',
    questions: [
      {
        id: 'cycle_pattern',
        type: 'options',
        text: 'How would you describe your menstrual cycle over the past 12 months?',
        sub: 'Select the option that best describes your experience. This helps determine your STRAW+10 stage.',
        options: [
          { label: 'Regular cycles', desc: 'Cycles within 7 days of usual length, minimal variation' },
          { label: 'Slightly irregular', desc: 'Cycle length varies by 7+ days, at least twice' },
          { label: 'Very irregular', desc: '60+ day intervals between periods in the past year' },
          { label: 'No periods', desc: 'No menstrual bleeding for 12 or more months' },
        ],
      },
      {
        id: 'cycle_numbers',
        type: 'inputs',
        text: 'Menstrual details',
        sub: 'Provide as accurately as possible. Leave blank if unsure.',
        fields: [
          { id: 'menarche_age', label: 'Age at first period', placeholder: 'e.g. 13' },
          { id: 'cycle_length', label: 'Average cycle length (days)', placeholder: 'e.g. 28' },
          { id: 'lmp_months', label: 'Months since last period', placeholder: 'e.g. 6' },
        ],
      },
    ],
  },
  {
    id: 'reproductive',
    label: 'Reproductive health',
    color: 'baby-pink',
    questions: [
      {
        id: 'marital_status',
        type: 'options',
        text: 'What is your current marital status?',
        sub: 'This provides holistic context for your reproductive health and lifestyle.',
        options: [
          { label: 'Single', desc: 'Never married' },
          { label: 'Married', desc: 'Currently married' },
          { label: 'Divorced / Separated', desc: '' },
          { label: 'Widowed', desc: '' },
        ],
      },
      {
        id: 'reproductive_details',
        type: 'inputs',
        text: 'Reproductive history',
        sub: 'Provide the following details. Leave blank if not applicable.',
        fields: [
          { id: 'age_of_marriage', label: 'Age of marriage', placeholder: 'e.g. 25' },
          { id: 'total_pregnancies', label: 'Total number of pregnancies', placeholder: 'e.g. 3' },
          { id: 'total_live_births', label: 'Total live births', placeholder: 'e.g. 2' },
          { id: 'number_of_miscarriages', label: 'Number of miscarriages', placeholder: 'e.g. 1' },
        ],
      },
      {
        id: 'delivery_mode',
        type: 'multi',
        text: 'What was your mode of delivery?',
        sub: 'Select all that apply for your past pregnancies.',
        options: [
          { label: 'Vaginal Delivery', desc: 'Normal vaginal delivery' },
          { label: 'C-Section', desc: 'Cesarean delivery' },
          { label: 'None / Not applicable', desc: 'No previous deliveries' },
        ],
      },
    ],
  },
  {
    id: 'symptoms',
    label: 'Symptoms',
    color: 'purple',
    questions: [
      {
        id: 'vasomotor',
        type: 'multi',
        text: 'Which of these symptoms have you experienced in the past month?',
        sub: 'Select all that apply. These help assess your current menopausal phase and quality of life.',
        options: [
          { label: 'Hot flashes / night sweats', desc: 'Sudden warmth, flushing, or sweating episodes' },
          { label: 'Sleep difficulties', desc: 'Trouble falling asleep or staying asleep' },
          { label: 'Mood changes', desc: 'Irritability, anxiety, or low mood' },
          { label: 'Vaginal dryness', desc: 'Dryness, itching, or discomfort' },
          { label: 'Joint pain', desc: 'Aching joints, particularly in mornings' },
          { label: 'Memory or concentration issues', desc: 'Brain fog or difficulty focusing' },
        ],
      },
    ],
  },
  {
    id: 'health',
    label: 'Health & labs',
    color: 'pink',
    questions: [
      {
        id: 'conditions',
        type: 'multi',
        text: 'Have you been diagnosed with any of the following?',
        sub: 'Select all that apply. This helps assess cardiovascular and bone health risk accurately.',
        options: [
          { label: 'High blood pressure', desc: 'Hypertension, currently managed or unmanaged' },
          { label: 'High cholesterol', desc: 'Hyperlipidaemia or elevated LDL' },
          { label: 'Diabetes (Type 2)', desc: 'Currently managing blood sugar levels' },
          { label: 'Osteopenia / low bone density', desc: 'T-score between −1 and −2.5' },
          { label: 'Heart disease', desc: 'Any prior cardiac event or condition' },
          { label: 'None of the above', desc: 'No known chronic conditions' },
        ],
      },
      {
        id: 'pap_smear',
        type: 'options',
        text: 'Have you had a Pap smear test?',
        sub: 'Cervical cancer screening.',
        options: [
          { label: 'Yes', desc: '' },
          { label: 'No', desc: '' }
        ],
      },
      {
        id: 'mammography',
        type: 'options',
        text: 'Have you had a Mammography?',
        sub: 'Breast cancer screening.',
        options: [
          { label: 'Yes', desc: '' },
          { label: 'No', desc: '' }
        ],
      },
      {
        id: 'bone_density',
        type: 'options',
        text: 'Have you had a Bone density test?',
        sub: 'Screening for osteoporosis (DEXA scan).',
        options: [
          { label: 'Yes', desc: '' },
          { label: 'No', desc: '' }
        ],
      },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    color: 'amber',
    questions: [
      {
        id: 'activity',
        type: 'options',
        text: 'How would you describe your physical activity level?',
        sub: 'Average across the past 3 months.',
        options: [
          { label: 'Sedentary', desc: 'Desk job or minimal movement through the day' },
          { label: 'Lightly active', desc: 'Walking 1–2 times per week or light household work' },
          { label: 'Moderately active', desc: '30+ minutes of exercise, 3–4 times per week' },
          { label: 'Very active', desc: 'Daily exercise or physically demanding job' },
        ],
      },
      {
        id: 'diet',
        type: 'options',
        text: 'How would you describe your diet?',
        sub: 'This helps us tailor nutrition-related recommendations.',
        options: [
          { label: 'Mostly traditional Pakistani diet', desc: 'Roti, rice, daal, sabzi, meat — home-cooked' },
          { label: 'Mixed diet', desc: 'Combination of traditional and processed or fast food' },
          { label: 'Vegetarian / plant-based', desc: 'Little or no meat, focus on vegetables and legumes' },
          { label: 'Low-dairy diet', desc: 'Minimal milk, yoghurt, or cheese consumption' },
        ],
      },
    ],
  },
]

export default function Assessment() {
  const navigate = useNavigate()
  const [sectionIdx, setSectionIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [showError, setShowError] = useState(false)

  const section = SECTIONS[sectionIdx]
  const question = section.questions[questionIdx]
  const totalQuestions = SECTIONS.reduce((a, s) => a + s.questions.length, 0)
  const completedQuestions = SECTIONS.slice(0, sectionIdx).reduce((a, s) => a + s.questions.length, 0) + questionIdx
  const progress = Math.round((completedQuestions / totalQuestions) * 100)

  const toggleAnswer = (qid, val) => {
    setShowError(false)
    if (question.type === 'multi') {
      const cur = answers[qid] || []
      setAnswers(a => ({ ...a, [qid]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] }))
    } else {
      setAnswers(a => ({ ...a, [qid]: val }))
    }
  }

  const isQuestionAnswered = () => {
    if (question.type === 'options') {
      return !!answers[question.id]
    } else if (question.type === 'multi') {
      const ans = answers[question.id]
      return Array.isArray(ans) && ans.length > 0
    } else if (question.type === 'inputs') {
      return question.fields.every(f => {
        const val = answers[f.id]
        return val !== undefined && val !== null && String(val).trim() !== ''
      })
    }
    return false
  }

  const canProceed = isQuestionAnswered()

  const handleNext = async () => {
    if (!canProceed) {
      setShowError(true)
      return
    }
    setShowError(false)
    if (questionIdx < section.questions.length - 1) {
      setQuestionIdx(q => q + 1)
    } else if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(s => s + 1)
      setQuestionIdx(0)
    } else {
      setLoading(true)
      const payload = {
        age: answers.age_group === 'Under 35' ? 30 : answers.age_group === '35 – 44' ? 40 : answers.age_group === '45 – 54' ? 50 : 60,
        height: answers.height,
        weight: answers.weight,
        cycle_pattern: answers.cycle_pattern,
        physical_activity: answers.activity,
        diet: answers.diet,
        diagnoses: (answers.conditions || []).join(', '),
        hot_flashes: answers.vasomotor?.includes('Hot flashes / night sweats') ? 'sometimes' : 'never',
        night_sweats: answers.vasomotor?.includes('Hot flashes / night sweats') ? 'sometimes' : 'never',
        sleep_disturbances: answers.vasomotor?.includes('Sleep difficulties') ? 'sometimes' : 'never',
        mood_swings: answers.vasomotor?.includes('Mood changes') ? 'sometimes' : 'never',
        vaginal_dryness: answers.vasomotor?.includes('Vaginal dryness') ? 'sometimes' : 'never',
        joint_pain: answers.vasomotor?.includes('Joint pain') ? 'sometimes' : 'never',
        memory_issues: answers.vasomotor?.includes('Memory or concentration issues') ? 'sometimes' : 'never',
        marital_status: answers.marital_status || '',
        age_of_marriage: answers.age_of_marriage || '',
        total_pregnancies: answers.total_pregnancies || '',
        total_live_births: answers.total_live_births || '',
        number_of_miscarriages: answers.number_of_miscarriages || '',
        delivery_mode: (answers.delivery_mode || []).join(', '),
        pap_smear: answers.pap_smear || '',
        mammography: answers.mammography || '',
        bone_density: answers.bone_density || '',
      }
      try {
        const data = await predictHealth(payload)
        navigate('/results', { state: { data } })
      } catch (err) {
        console.error(err)
        navigate('/results', { state: { error: true } })
      }
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (questionIdx > 0) setQuestionIdx(q => q - 1)
    else if (sectionIdx > 0) { setSectionIdx(s => s - 1); setQuestionIdx(SECTIONS[sectionIdx - 1].questions.length - 1) }
  }

  const isFirst = sectionIdx === 0 && questionIdx === 0
  const isLast = sectionIdx === SECTIONS.length - 1 && questionIdx === section.questions.length - 1

  return (
    <div className={styles.page}>
      <Navbar minimal />

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {SECTIONS.map((s, i) => {
            const done = i < sectionIdx
            const active = i === sectionIdx
            return (
              <div key={s.id} className={`${styles.sideItem} ${active ? styles.sideActive : ''} ${done ? styles.sideDone : ''}`}
                onClick={() => { 
                  if (i <= sectionIdx) {
                    setSectionIdx(i); setQuestionIdx(0)
                  }
                }}>
                <div className={styles.sideNum}>{done ? '✓' : i + 1}</div>
                <span>{s.label}</span>
              </div>
            )
          })}
          <div className={styles.sideProgress}>
            <div className={styles.sideProgressLabel}>
              <span>Progress</span>
              <span style={{ color: 'var(--baby-pink-400)', fontWeight: 500 }}>{progress}%</span>
            </div>
            <div className={styles.sideProgressBar}>
              <div className={styles.sideProgressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.qWrap} key={`${sectionIdx}-${questionIdx}`} style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div className={`badge badge-${section.color}`} style={{ marginBottom: 16 }}>
              {section.label}
            </div>
            <h2 className={styles.qTitle}>{question.text}</h2>
            <p className={styles.qSub}>{question.sub}</p>

            {(question.type === 'options' || question.type === 'multi') && (
              <div className={`${styles.optGrid} ${question.options.length > 4 ? styles.optGrid3 : ''}`}>
                {question.options.map(opt => {
                  const sel = question.type === 'multi'
                    ? (answers[question.id] || []).includes(opt.label)
                    : answers[question.id] === opt.label
                  return (
                    <div key={opt.label}
                      className={`${styles.optCard} ${sel ? styles.optSelected : ''}`}
                      onClick={() => toggleAnswer(question.id, opt.label)}>
                      <div className={styles.optTop}>
                        <div className={`${styles.optCheck} ${sel ? styles.optCheckFilled : ''}`}>
                          {sel && (question.type === 'multi'
                            ? <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                            : <div className={styles.optDot} />
                          )}
                        </div>
                        <span className={styles.optLabel}>{opt.label}</span>
                      </div>
                      {opt.desc && <p className={styles.optDesc}>{opt.desc}</p>}
                    </div>
                  )
                })}
              </div>
            )}

            {question.type === 'inputs' && (
              <div className={styles.inputGrid}>
                {question.fields.map(f => (
                  <div key={f.id} className={styles.inputGroup}>
                    <label className={styles.inputLabel}>{f.label}</label>
                    <input className={styles.input}
                      type="number"
                      placeholder={f.placeholder}
                      value={answers[f.id] || ''}
                      onChange={e => {
                        setShowError(false)
                        setAnswers(a => ({ ...a, [f.id]: e.target.value }))
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.footerNote}>
              Question {questionIdx + 1} of {section.questions.length} in this section
            </span>
            <div className={styles.footerActions}>
              {showError && <span style={{ color: '#d32f2f', fontSize: '14px', marginRight: '16px', fontWeight: 500 }}>Each question should be answered</span>}
              {!isFirst && <button className="btn-secondary" onClick={handleBack}>Back</button>}
              <button className="btn-primary" onClick={handleNext} disabled={loading}>
                {loading ? 'Processing...' : isLast ? 'View results' : 'Next'}
                {!loading && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
