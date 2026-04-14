import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import { getFeatureImportance } from '../../api'

const MODELS = [
  'Menopause Stage',
  'Symptom Severity',
  'Osteoporosis Risk',
  'Cardiovascular Risk',
  'Hormonal Imbalance',
  'Reproductive Profile',
]

export default function FeatureImportanceCard() {
  const { t } = useLang()
  const [model, setModel] = useState('Menopause Stage')
  const [features, setFeatures] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(false)
    getFeatureImportance(model)
      .then(data => {
        if (!cancelled && Array.isArray(data)) setFeatures(data.slice(0, 7))
      })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [model])

  const maxImp = features[0]?.importance || 1

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h3>🔑 {t('results', 'keyFactors')}</h3>
      <select className="fi-select" value={model} onChange={e => setModel(e.target.value)}>
        {MODELS.map(m => <option key={m}>{m}</option>)}
      </select>

      {error ? (
        <p className="fi-err">Start Flask server to see feature importance.</p>
      ) : (
        <div className="fi-list">
          {features.map((f, i) => (
            <div className="fi-row" key={f.feature}>
              <span className="fi-label">{f.feature}</span>
              <div className="fi-track">
                <motion.div
                  className="fi-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.importance / maxImp * 100).toFixed(1)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="fi-pct">{f.importance.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .fi-select {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid var(--sage-wash);
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.8);
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text);
          margin-bottom: 14px;
          outline: none;
        }
        .fi-select:focus { border-color: var(--sage); }
        .fi-list { display: flex; flex-direction: column; gap: 8px; }
        .fi-row { display: flex; align-items: center; gap: 8px; }
        .fi-label {
          font-size: 0.73rem;
          font-weight: 500;
          color: var(--text-muted);
          min-width: 100px;
          text-align: right;
        }
        .fi-track {
          flex: 1;
          height: 6px;
          background: var(--sage-wash);
          border-radius: 4px;
          overflow: hidden;
        }
        .fi-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--terracotta-light), var(--terracotta));
        }
        .fi-pct {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--terracotta);
          min-width: 32px;
        }
        .fi-err {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </motion.div>
  )
}
