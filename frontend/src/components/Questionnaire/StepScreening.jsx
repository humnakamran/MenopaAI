import { useLang } from '../../context/LanguageContext'

export default function StepScreening({ data, onChange }) {
  const { t } = useLang()

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step7', 'title')}</h2>
      <p className="step-subtitle">{t('step7', 'subtitle')}</p>

      <div className="field">
        <label>Pap Smear</label>
        <select value={data.papSmear} onChange={e => onChange({ papSmear: e.target.value })}>
          <option>Within 3 years</option>
          <option>More than 3 years ago</option>
          <option>Never</option>
        </select>
      </div>

      <div className="field">
        <label>Mammography</label>
        <select value={data.mammography} onChange={e => onChange({ mammography: e.target.value })}>
          <option>Within 2 years</option>
          <option>More than 2 years ago</option>
          <option>Never</option>
        </select>
      </div>

      <div className="field">
        <label>Bone Density Test</label>
        <select value={data.boneDensity} onChange={e => onChange({ boneDensity: e.target.value })}>
          <option>Never</option>
          <option>Within 2 years</option>
          <option>More than 2 years ago</option>
        </select>
      </div>
    </div>
  )
}
