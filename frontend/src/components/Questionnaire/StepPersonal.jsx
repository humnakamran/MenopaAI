import { useMemo } from 'react'
import { useLang } from '../../context/LanguageContext'

export default function StepPersonal({ data, onChange }) {
  const { t } = useLang()

  const bmi = useMemo(() => {
    const h = parseFloat(data.height) / 100
    const w = parseFloat(data.weight)
    if (h > 0 && w > 0) return (w / (h * h)).toFixed(1)
    return null
  }, [data.height, data.weight])

  const bmiCategory = useMemo(() => {
    if (!bmi) return null
    if (bmi < 18.5) return { label: 'Underweight', cls: 'bmi-under' }
    if (bmi < 25) return { label: 'Normal', cls: 'bmi-normal' }
    if (bmi < 30) return { label: 'Overweight', cls: 'bmi-over' }
    return { label: 'Obese', cls: 'bmi-obese' }
  }, [bmi])

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step1', 'title')}</h2>
      <p className="step-subtitle">{t('step1', 'subtitle')}</p>

      <div className="field">
        <label>{t('step1', 'age')}</label>
        <input
          type="number"
          placeholder="e.g. 45"
          min="18"
          max="80"
          value={data.age}
          onChange={e => onChange({ age: e.target.value })}
        />
        {data._ageError && <span className="field-error">{t('step1', 'ageErr')}</span>}
      </div>

      <div className="field">
        <label>{t('step1', 'province')}</label>
        <select value={data.province} onChange={e => onChange({ province: e.target.value })}>
          <option>Punjab</option>
          <option>Sindh</option>
          <option>KPK</option>
          <option>Balochistan</option>
          <option>Gilgit-Baltistan</option>
          <option>AJK</option>
          <option>Islamabad</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field half">
          <label>{t('step1', 'height')}</label>
          <input
            type="number"
            placeholder="160"
            min="100"
            max="220"
            value={data.height}
            onChange={e => onChange({ height: e.target.value })}
          />
        </div>
        <div className="field half">
          <label>{t('step1', 'weight')}</label>
          <input
            type="number"
            placeholder="65"
            min="30"
            max="200"
            value={data.weight}
            onChange={e => onChange({ weight: e.target.value })}
          />
        </div>
      </div>

      {(bmi || data.height || data.weight) && (
        <div className="bmi-display">
          <span>{t('step1', 'bmi')}</span>
          <strong>{bmi || '--'}</strong>
          {bmiCategory && <span className={`bmi-badge ${bmiCategory.cls}`}>{bmiCategory.label}</span>}
        </div>
      )}
    </div>
  )
}
