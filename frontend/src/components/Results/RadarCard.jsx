import { useLang } from '../../context/LanguageContext'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer
} from 'recharts'

export default function RadarCard({ data }) {
  const { t } = useLang()
  const radarData = data?.radar_data

  if (!radarData) return null

  const chartData = Object.entries(radarData).map(([key, val]) => ({
    category: key,
    value: val,
  }))

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <h3>🕸️ {t('results', 'radar')}</h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <RadarChart data={chartData} outerRadius="75%">
            <PolarGrid stroke="var(--sage-wash)" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              domain={[0, 2]}
              tickCount={3}
              tick={{ fill: 'var(--text-light)', fontSize: 10 }}
            />
            <Radar
              name="Symptoms"
              dataKey="value"
              stroke="var(--sage)"
              fill="var(--sage)"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--sage)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
