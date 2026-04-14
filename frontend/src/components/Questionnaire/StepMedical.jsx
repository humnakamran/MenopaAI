import { useLang } from '../../context/LanguageContext'

const CONDITIONS = [
  { id: 'pcos', label: 'PCOS', backendLabel: 'pcos' },
  { id: 'diabetes', tKey: 'diabetes', backendLabel: 'diabetes' },
  { id: 'hypertension', tKey: 'hypertension', backendLabel: 'hypertension' },
  { id: 'thyroid', tKey: 'thyroid', backendLabel: 'thyroid disorder' },
  { id: 'heart', tKey: 'heart', backendLabel: 'heart disease' },
  { id: 'osteoporosis', label: 'Osteoporosis', backendLabel: 'osteoporosis' },
  { id: 'anemia', tKey: 'anemia', backendLabel: 'anemia' },
  { id: 'vitd', tKey: 'vitd', backendLabel: 'vitamin D deficiency' },
]

export default function StepMedical({ data, onChange }) {
  const { t } = useLang()

  const toggleCondition = (id) => {
    const conditions = { ...data.conditions }
    conditions[id] = !conditions[id]
    onChange({ conditions })
  }

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step5', 'title')}</h2>
      <p className="step-subtitle">{t('step5', 'subtitle')}</p>

      <div className="symptom-grid">
        {CONDITIONS.map(c => (
          <label
            key={c.id}
            className={`symptom-chip ${data.conditions[c.id] ? 'active' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!data.conditions[c.id]}
              onChange={() => toggleCondition(c.id)}
            />
            <span className="symptom-name">
              {c.tKey ? t('step5', c.tKey) : c.label}
            </span>
          </label>
        ))}
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label>{t('step5', 'familyHistory')}</label>
        <select value={data.familyHistory} onChange={e => onChange({ familyHistory: e.target.value })}>
          <option value="none">None</option>
          <option value="diabetes">Diabetes</option>
          <option value="heart disease">Heart Disease</option>
          <option value="breast cancer">Breast Cancer</option>
          <option value="osteoporosis">Osteoporosis</option>
          <option value="PCOS">PCOS</option>
          <option value="diabetes;osteoporosis">Diabetes &amp; Osteoporosis</option>
          <option value="heart disease;diabetes">Heart Disease &amp; Diabetes</option>
        </select>
      </div>
    </div>
  )
}
