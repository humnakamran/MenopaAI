import { useLang } from '../../context/LanguageContext'

export default function StepReproductive({ data, onChange }) {
  const { t } = useLang()

  return (
    <div className="step-content">
      <h2 className="step-title">{t('step3', 'title')}</h2>

      <div className="field-row">
        <div className="field half">
          <label>{t('step3', 'pregnancies')}</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            max="20"
            value={data.pregnancies}
            onChange={e => onChange({ pregnancies: e.target.value })}
          />
        </div>
        <div className="field half">
          <label>{t('step3', 'liveBirths')}</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            max="20"
            value={data.liveBirths}
            onChange={e => onChange({ liveBirths: e.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label>{t('step3', 'miscarriages')}</label>
        <input
          type="number"
          placeholder="0"
          min="0"
          max="20"
          value={data.miscarriages}
          onChange={e => onChange({ miscarriages: e.target.value })}
        />
      </div>

      <div className="field checkbox-field">
        <label className="check-label">
          <input
            type="checkbox"
            checked={data.stillbirth}
            onChange={e => onChange({ stillbirth: e.target.checked })}
          />
          <span>{t('step3', 'stillbirth')}</span>
        </label>
      </div>

      <div className="field checkbox-field">
        <label className="check-label">
          <input
            type="checkbox"
            checked={data.infertility}
            onChange={e => onChange({ infertility: e.target.checked })}
          />
          <span>{t('step3', 'infertility')}</span>
        </label>
      </div>

      <div className="field">
        <label>{t('step3', 'pcos')}</label>
        <select value={data.pcosDiagnosis} onChange={e => onChange({ pcosDiagnosis: e.target.value })}>
          <option value="No">No</option>
          <option value="Yes">Yes — confirmed</option>
          <option value="Suspected but not confirmed">Suspected</option>
        </select>
      </div>
    </div>
  )
}
