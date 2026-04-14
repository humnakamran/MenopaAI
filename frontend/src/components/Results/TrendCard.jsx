import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const STORAGE_KEY = 'menopaai_trend'

export default function TrendCard({ data }) {
  const { t } = useLang()
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!data?.status) return
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const entry = {
      date: new Date().toLocaleDateString('en-GB'),
      symptom_score: data.symptom_score || 0,
      osteo: data.osteo_pct || 25,
      cardio: data.cardio_pct || 25,
      stage: data.stage_prediction,
    }
    stored.push(entry)
    if (stored.length > 10) stored.shift()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    setHistory(stored)
  }, [data])

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <h3>📈 {t('results', 'timeline')}</h3>

      {history.length < 2 ? (
        <div className="trend-empty">
          <p>🌱 {t('results', 'firstAssessment')}</p>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="symptom_score"
                  name="Symptom Score"
                  stroke="var(--terracotta)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--terracotta)' }}
                />
                <Line
                  type="monotone"
                  dataKey="osteo"
                  name="Osteoporosis Risk %"
                  stroke="var(--sage)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--sage)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <button className="trend-clear-btn" onClick={clearHistory}>
            🗑 {t('results', 'clearHistory')}
          </button>
        </>
      )}

      <style>{`
        .trend-empty {
          text-align: center;
          padding: 24px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .trend-clear-btn {
          margin-top: 10px;
          font-family: var(--font-body);
          font-size: 0.78rem;
          padding: 6px 14px;
          border: 1px solid var(--sage-wash);
          border-radius: 100px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .trend-clear-btn:hover {
          border-color: #ec7063;
          color: #ec7063;
        }
      `}</style>
    </motion.div>
  )
}
