import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts'

const PAK_DATA = [
  { year: '2015', awareness: 18, osteo: 14, pcos: 8 },
  { year: '2016', awareness: 22, osteo: 16, pcos: 9 },
  { year: '2017', awareness: 27, osteo: 18, pcos: 10 },
  { year: '2018', awareness: 32, osteo: 21, pcos: 11 },
  { year: '2019', awareness: 38, osteo: 23, pcos: 12 },
  { year: '2020', awareness: 42, osteo: 25, pcos: 13 },
  { year: '2021', awareness: 50, osteo: 27, pcos: 14 },
  { year: '2022', awareness: 57, osteo: 29, pcos: 15 },
  { year: '2023', awareness: 63, osteo: 30, pcos: 17 },
  { year: '2024', awareness: 70, osteo: 32, pcos: 18 },
]

export default function PakTrendsCard() {
  const { t } = useLang()

  return (
    <motion.div
      className="dash-card pak-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <h3>📊 {t('results', 'pakTrends')}</h3>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={PAK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sage-wash)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--cream)',
                border: '1px solid var(--sage-wash)',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="awareness"
              name="Menopause Awareness (%)"
              stroke="var(--sage)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'var(--sage)' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="osteo"
              name="Osteoporosis Incidence (%)"
              stroke="var(--sage-deep)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 2.5 }}
            />
            <Line
              type="monotone"
              dataKey="pcos"
              name="PCOS Prevalence (%)"
              stroke="var(--terracotta)"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .pak-card { grid-column: 1 / -1; }
      `}</style>
    </motion.div>
  )
}
