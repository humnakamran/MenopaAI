import { useLang } from '../../context/LanguageContext'

export default function StepLifestyle({ data, onChange }) {
  const { t } = useLang()

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step6', 'title')}</h2>

      <div className="field">
        <label>{t('step6', 'diet')}</label>
        <select value={data.diet} onChange={e => onChange({ diet: e.target.value })}>
          <option value="Balanced/Mixed diet">Balanced / Mixed</option>
          <option value="High-protein diet">High Protein</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Traditional/local diet">Traditional / Local</option>
          <option value="Fast food / Processed food">Fast Food / Processed</option>
          <option value="Low-calorie / Weight-loss diet">Low Calorie</option>
        </select>
      </div>

      <div className="field">
        <label>{t('step6', 'activity')}</label>
        <select value={data.physicalActivity} onChange={e => onChange({ physicalActivity: e.target.value })}>
          <option value="Active (3+ times/week)">Active (3+ times/week)</option>
          <option value="Moderate physical work">Moderate</option>
          <option value="Light activity (walking occasionally)">Light</option>
          <option value="Mostly sitting (sedentary)">Sedentary</option>
        </select>
      </div>

      <div className="field">
        <label>{t('step6', 'stress')}</label>
        <select value={data.stressLevel} onChange={e => onChange({ stressLevel: e.target.value })}>
          <option value="1">1 — Very Low</option>
          <option value="2">2 — Low</option>
          <option value="3">3 — Moderate</option>
          <option value="4">4 — High</option>
          <option value="5">5 — Very High</option>
        </select>
      </div>

      <div className="field checkbox-field">
        <label className="check-label">
          <input
            type="checkbox"
            checked={data.smoking}
            onChange={e => onChange({ smoking: e.target.checked })}
          />
          <span>{t('step6', 'smoking')}</span>
        </label>
      </div>
    </div>
  )
}
