import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'

export default function RecommendationsCard({ data }) {
  const { t } = useLang()
  const recs = data?.recommendations || []

  if (!recs.length) return null

  return (
    <motion.div className="dash-card recs-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <h3>💡 {t('results', 'recs')}</h3>
      <ul className="recs-list">
        {recs.map((rec, i) => (
          <motion.li
            key={i}
            className="rec-item"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          >
            <span className="rec-emoji">{rec.emoji}</span>
            <div className="rec-body">
              <strong>{rec.title}:</strong> {rec.text}
            </div>
          </motion.li>
        ))}
      </ul>

      <style>{`
        .recs-card { grid-column: span 2; }
        .recs-list { list-style: none; padding: 0; margin: 0; }
        .rec-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.6);
          border-radius: var(--radius-md);
          margin-bottom: 8px;
          border-left: 3px solid var(--sage-mist);
          transition: border-color 0.2s;
        }
        .rec-item:hover { border-left-color: var(--sage); }
        .rec-emoji { font-size: 1.3rem; flex-shrink: 0; margin-top: 1px; }
        .rec-body {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text);
        }
        .rec-body strong { color: var(--sage-deep); }
        @media (max-width: 768px) { .recs-card { grid-column: span 1; } }
      `}</style>
    </motion.div>
  )
}
