import { motion } from 'framer-motion'
import { useLang } from '../../context/LanguageContext'
import StageCard from './StageCard'
import SeverityCard from './SeverityCard'
import RiskCard from './RiskCard'
import ReproCard from './ReproCard'
import RadarCard from './RadarCard'
import FeatureImportanceCard from './FeatureImportanceCard'
import RecommendationsCard from './RecommendationsCard'
import TrendCard from './TrendCard'
import HealthFactsCard from './HealthFactsCard'
import PakTrendsCard from './PakTrendsCard'

export default function ResultsDashboard({ data, payload, onRestart, onDownloadPdf, reportRef }) {
  const { t } = useLang()
  const isSuccess = data?.status === 'success'

  const fallbackStage = () => {
    const status = (payload?.current_menstrual_status || '').toLowerCase()
    if (status.includes('>12') || status.includes('permanent')) return 'Post-menopause'
    if (status.includes('irregular') || status.includes('<12')) return 'Peri-menopause'
    return 'Pre-menopause'
  }

  return (
    <motion.div
      className="results-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results-header">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {t('results', 'title')}
        </motion.h2>
        <motion.p
          className="results-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('results', 'subtitle')}
        </motion.p>
        <motion.div
          className="results-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button className="action-btn" onClick={onDownloadPdf}>
            📄 {t('results', 'downloadPdf')}
          </button>
          <button className="action-btn action-outline" onClick={onRestart}>
            🔄 {t('results', 'startOver')}
          </button>
        </motion.div>
      </div>

      <div className="dashboard-grid" ref={reportRef}>
        {isSuccess ? (
          <>
            <StageCard data={data} />
            <SeverityCard data={data} />
            <RiskCard data={data} />
            <ReproCard data={data} />
            <RadarCard data={data} />
            <FeatureImportanceCard />
            <RecommendationsCard data={data} />
            <TrendCard data={data} />
            <HealthFactsCard />
            <PakTrendsCard />
          </>
        ) : (
          <>
            <motion.div className="dash-card fallback-card" style={{ gridColumn: 'span 2' }}>
              <h3>🌿 {t('results', 'stage')}</h3>
              <div className="stage-badge" style={{ background: 'var(--sage)' }}>
                {fallbackStage()}
              </div>
              <div className="fallback-notice">
                <p>⚠️ <strong>Backend Offline:</strong> Run <code>py -3.12 app.py</code> to get AI predictions.</p>
                <p>🥗 <strong>Nutrition:</strong> Increase calcium to 1200 mg/day.</p>
              </div>
            </motion.div>
            <HealthFactsCard />
            <PakTrendsCard />
          </>
        )}
      </div>

      <style>{`
        .results-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .results-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .results-header h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
        }
        .results-sub {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 6px;
        }
        .results-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 18px;
        }
        .action-btn {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 9px 20px;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.25s var(--ease-spring);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1.5px solid rgba(236,64,122,0.25);
          background: var(--card-bg);
          color: var(--terracotta);
        }
        .action-btn:hover {
          background: var(--terracotta);
          color: white;
          border-color: var(--terracotta);
          transform: translateY(-2px);
        }
        .action-outline {
          background: transparent;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .dash-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-xl);
          padding: 24px;
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(10px);
        }
        .dash-card h3 {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--sage-deep);
          margin-bottom: 14px;
        }
        .fallback-card .stage-badge {
          display: inline-block;
          color: white;
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          padding: 10px 28px;
          border-radius: 100px;
          margin: 8px 0 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .fallback-notice {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fallback-notice p {
          padding: 12px 16px;
          background: rgba(255,255,255,0.6);
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          border-left: 3px solid var(--terracotta-light);
        }
        .fallback-notice code {
          background: var(--sage-wash);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.82rem;
          color: var(--sage-deep);
        }
        @media (max-width: 768px) {
          .results-section { padding: 24px 16px 60px; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .results-actions { flex-direction: column; align-items: center; }
        }
      `}</style>
    </motion.div>
  )
}
