import { useLang } from '../../context/LanguageContext'

const SYMPTOMS = [
  { key: 'hot_flashes', icon: '🔥', tKey: 'hotFlashes' },
  { key: 'night_sweats', icon: '🌙', tKey: 'nightSweats' },
  { key: 'sleep_disturbances', icon: '😴', tKey: 'sleepDist' },
  { key: 'mood_swings', icon: '😤', tKey: 'moodSwings' },
  { key: 'anxiety', icon: '😰', tKey: 'anxiety' },
  { key: 'depression', icon: '😔', tKey: 'depression' },
  { key: 'vaginal_dryness', icon: '💧', tKey: 'vagDryness' },
  { key: 'joint_pain', icon: '🦵', tKey: 'jointPain' },
  { key: 'memory_issues', icon: '🧠', tKey: 'memory' },
  { key: 'fatigue', icon: '😩', tKey: 'fatigue' },
  { key: 'hair_thinning', icon: '💇', tKey: 'hairThin' },
  { key: 'weight_gain_symptom', icon: '⚖️', tKey: 'weightGain' },
]

export default function StepSymptoms({ data, onChange }) {
  const { t } = useLang()

  const toggleSymptom = (key) => {
    const symptoms = { ...data.symptoms }
    symptoms[key] = !symptoms[key]
    onChange({ symptoms })
  }

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step4', 'title')}</h2>
      <p className="step-subtitle">{t('step4', 'subtitle')}</p>

      <div className="symptom-grid">
        {SYMPTOMS.map(s => (
          <label
            key={s.key}
            className={`symptom-chip ${data.symptoms[s.key] ? 'active' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!data.symptoms[s.key]}
              onChange={() => toggleSymptom(s.key)}
            />
            <span className="symptom-icon">{s.icon}</span>
            <span className="symptom-name">{t('step4', s.tKey)}</span>
          </label>
        ))}
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label>{t('step4', 'intensity')}</label>
        <select value={data.symptomIntensity} onChange={e => onChange({ symptomIntensity: e.target.value })}>
          <option value="rarely">Mild — rarely bother me</option>
          <option value="sometimes">Moderate — sometimes bother me</option>
          <option value="often">Frequent — often bother me</option>
          <option value="severe / daily">Severe — daily / very severe</option>
        </select>
      </div>
    </div>
  )
}
