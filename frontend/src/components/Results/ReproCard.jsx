import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'

const reproDescs = {
  'Fertile/Normal': 'Reproductive health appears normal. Continue routine gynecological check-ups.',
  'At Risk (PCOS/Infertility)': 'PCOS/infertility indicators detected. Consult a reproductive specialist.',
  'Complicated Reproductive History': 'Complex reproductive history noted. Regular monitoring advised.',
}

function reproStyle(profile) {
  if (profile?.includes('Normal')) return 'linear-gradient(135deg, #58d68d, #27ae60)'
  if (profile?.includes('Risk')) return 'linear-gradient(135deg, var(--gold), var(--terracotta-light))'
  return 'linear-gradient(135deg, #ec7063, #c0392b)'
}

export default function ReproCard({ data }) {
  const { t } = useLang()
  const profile = data?.repro_profile || '—'

  return (
    <motion.div className="dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <h3>🌺 {t('results', 'repro')}</h3>
      <span className="repro-badge" style={{ background: reproStyle(profile) }}>
        {profile}
      </span>
      <p className="repro-desc">{reproDescs[profile] || ''}</p>

      <style>{`
        .repro-badge {
          display: inline-block;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 100px;
          color: white;
          margin-top: 8px;
          line-height: 1.4;
        }
        .repro-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 10px;
        }
      `}</style>
    </motion.div>
  )
}
