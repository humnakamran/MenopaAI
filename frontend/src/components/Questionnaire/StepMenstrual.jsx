import { useLang } from '../../context/LanguageContext'

export default function StepMenstrual({ data, onChange }) {
  const { t } = useLang()

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step2', 'title')}</h2>

      <div className="field">
        <label>{t('step2', 'menarcheAge')}</label>
        <input
          type="number"
          placeholder="e.g. 13"
          min="8"
          max="20"
          value={data.menarcheAge}
          onChange={e => onChange({ menarcheAge: e.target.value })}
        />
      </div>

      <div className="field">
        <label>{t('step2', 'cyclePattern')}</label>
        <select value={data.cyclePattern} onChange={e => onChange({ cyclePattern: e.target.value })}>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
          <option value="painful">Painful</option>
          <option value="heavy bleeding">Heavy Bleeding</option>
        </select>
      </div>

      <div className="field">
        <label>{t('step2', 'currentStatus')}</label>
        <select value={data.menstrualStatus} onChange={e => onChange({ menstrualStatus: e.target.value })}>
          <option value="regular periods">Regular periods</option>
          <option value="irregular periods">Irregular periods</option>
          <option value="no periods for<12 months">Stopped recently (&lt; 1 year)</option>
          <option value="no periods for>12 months">Stopped permanently (&gt; 1 year)</option>
        </select>
      </div>

      <div className="field">
        <label>{t('step2', 'earlyMenopause')}</label>
        <select value={data.earlyMenopause} onChange={e => onChange({ earlyMenopause: e.target.value })}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
    </div>
  )
}
