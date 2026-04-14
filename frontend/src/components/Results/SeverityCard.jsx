import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'

const sevStyles = {
  Mild: { bg: 'linear-gradient(135deg, #58d68d, #2ecc71)', desc: 'Your symptoms are mild. Lifestyle adjustments may help.' },
  Moderate: { bg: 'linear-gradient(135deg, var(--gold), var(--terracotta-light))', desc: 'Moderate symptoms. Consider speaking with a doctor.' },
  Severe: { bg: 'linear-gradient(135deg, #ec7063, #c0392b)', desc: 'Severe symptom burden. Medical consultation strongly recommended.' },
}

export default function SeverityCard({ data }) {
  const { t } = useLang()
  const severity = data?.symptom_severity || '—'
  const sev = sevStyles[severity] || {}
  const isYes = data?.hormonal_imbalance === 'Yes'

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <h3>⚡ {t('results', 'severity')}</h3>
      <div className="sev-center">
        <span className="sev-badge" style={{ background: sev.bg || 'var(--sage)' }}>{severity}</span>
        <p className="sev-desc">{sev.desc || ''}</p>
      </div>

      <div className="hormonal-section">
        <h4>🔬 {t('results', 'hormonal')}</h4>
        <span className={`hormonal-badge ${isYes ? 'h-yes' : 'h-no'}`}>
          {isYes ? '⚠️ Likely Imbalance' : '✅ No Concern'}
        </span>
        <p className="hormonal-desc">
          {isYes
            ? 'Hormonal imbalance indicators found. An FSH, LH, estradiol panel test is advisable.'
            : 'No significant hormonal imbalance indicators detected.'}
        </p>
      </div>

      <style>{`
        .sev-center { text-align: center; margin-bottom: 8px; }
        .sev-badge {
          display: inline-block;
          font-size: 1.2rem;
          font-weight: 700;
          padding: 8px 24px;
          border-radius: 100px;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .sev-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 6px;
        }
        .hormonal-section {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--sage-wash);
        }
        .hormonal-section h4 {
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--sage-deep);
          margin-bottom: 8px;
        }
        .hormonal-badge {
          display: inline-block;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 100px;
          color: white;
        }
        .h-yes { background: linear-gradient(135deg, var(--terracotta), var(--terracotta-dark)); }
        .h-no { background: linear-gradient(135deg, var(--sage), var(--sage-deep)); }
        .hormonal-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 6px;
        }
      `}</style>
    </motion.div>
  )
}
