import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import { getRandomFacts } from '../../data/healthFacts'

export default function HealthFactsCard() {
  const { t } = useLang()
  const [facts] = useState(() => getRandomFacts(4))

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <h3>📚 {t('results', 'tips')}</h3>
      <div className="facts-list">
        {facts.map((f, i) => (
          <motion.p
            key={i}
            className="fact-item"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            💡 {f}
          </motion.p>
        ))}
      </div>

      <style>{`
        .facts-list { display: flex; flex-direction: column; gap: 8px; }
        .fact-item {
          padding: 12px 16px;
          background: rgba(255,255,255,0.5);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--terracotta-light);
          font-size: 0.88rem;
          color: var(--text);
          line-height: 1.5;
        }
      `}</style>
    </motion.div>
  )
}
