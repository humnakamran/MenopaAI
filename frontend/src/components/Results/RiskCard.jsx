import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'

function riskColor(level) {
  if (level === 'High') return '#ec7063'
  if (level === 'Medium') return 'var(--gold)'
  return '#58d68d'
}

export default function RiskCard({ data }) {
  const { t } = useLang()
  const osteoPct = data?.osteo_pct || 25
  const cardioPct = data?.cardio_pct || 25
  const osteoLevel = data?.osteoporosis_risk || '—'
  const cardioLevel = data?.cardiovascular_risk || '—'

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h3>⚠️ {t('results', 'risks')}</h3>

      <div className="risk-item">
        <div className="risk-header">
          <span>🦴 {t('results', 'osteo')}</span>
          <span className="risk-label">{osteoLevel}</span>
        </div>
        <div className="risk-track">
          <motion.div
            className="risk-fill"
            style={{ background: riskColor(osteoLevel) }}
            initial={{ width: 0 }}
            animate={{ width: `${osteoPct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          />
        </div>
      </div>

      <div className="risk-item">
        <div className="risk-header">
          <span>❤️ {t('results', 'cardio')}</span>
          <span className="risk-label">{cardioLevel}</span>
        </div>
        <div className="risk-track">
          <motion.div
            className="risk-fill"
            style={{ background: riskColor(cardioLevel) }}
            initial={{ width: 0 }}
            animate={{ width: `${cardioPct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          />
        </div>
      </div>

      <style>{`
        .risk-item { margin-bottom: 16px; }
        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text);
        }
        .risk-label {
          font-size: 0.82rem;
          font-weight: 700;
        }
        .risk-track {
          width: 100%;
          height: 10px;
          background: var(--sage-wash);
          border-radius: 8px;
          overflow: hidden;
        }
        .risk-fill {
          height: 100%;
          border-radius: 8px;
        }
      `}</style>
    </motion.div>
  )
}
