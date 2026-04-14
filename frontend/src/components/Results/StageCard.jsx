import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'

const stageDescs = {
  'Pre-menopause': 'Your menstrual cycle is still regular. Focus on building bone density now.',
  'Peri-menopause': 'You are in the transition phase. Symptoms may fluctuate — monitoring is key.',
  'Post-menopause': 'Periods have stopped. Prioritise bone, heart, and hormonal health.',
}

const stageColors = {
  'Pre-menopause': 'var(--sage)',
  'Peri-menopause': 'var(--gold)',
  'Post-menopause': 'var(--terracotta)',
}

export default function StageCard({ data }) {
  const { t } = useLang()
  const stage = data?.stage_prediction || '—'
  const confidence = data?.stage_confidence || {}
  const accuracy = data?.model_accuracies?.['Menopause Stage']

  return (
    <motion.div className="dash-card stage-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <h3>🌿 {t('results', 'stage')}</h3>
      <div className="stage-badge" style={{ background: stageColors[stage] || 'var(--sage)' }}>
        {stage}
      </div>
      <p className="stage-desc">{stageDescs[stage] || ''}</p>

      {Object.keys(confidence).length > 0 && (
        <div className="conf-bars">
          {Object.entries(confidence).map(([label, pct]) => (
            <div className="conf-row" key={label}>
              <span className="conf-label">{label}</span>
              <div className="conf-track">
                <motion.div
                  className="conf-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
              </div>
              <span className="conf-pct">{pct}%</span>
            </div>
          ))}
        </div>
      )}

      {accuracy && (
        <div className="accuracy-chip">
          🎯 {t('results', 'modelAccuracy')}: <strong>{accuracy}%</strong>
        </div>
      )}

      <style>{`
        .stage-card { grid-column: span 2; }
        .stage-badge {
          display: inline-block;
          color: white;
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          padding: 10px 28px;
          border-radius: 100px;
          margin: 8px 0 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .stage-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .conf-bars { margin-top: 8px; }
        .conf-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .conf-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          min-width: 120px;
        }
        .conf-track {
          flex: 1;
          height: 7px;
          background: var(--sage-wash);
          border-radius: 6px;
          overflow: hidden;
        }
        .conf-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, var(--sage), var(--sage-deep));
        }
        .conf-pct {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--sage-deep);
          min-width: 36px;
          text-align: right;
        }
        .accuracy-chip {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: right;
          margin-top: 12px;
        }
        .accuracy-chip strong { color: var(--sage-deep); }
        @media (max-width: 768px) {
          .stage-card { grid-column: span 1; }
          .conf-label { min-width: 85px; font-size: 0.72rem; }
        }
      `}</style>
    </motion.div>
  )
}
