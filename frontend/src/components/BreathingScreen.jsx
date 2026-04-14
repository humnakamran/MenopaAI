import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

export default function BreathingScreen({ onFinish, predictionReady }) {
  const { t } = useLang()
  const [phase, setPhase] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const timerRef = useRef(null)
  const skipRef = useRef(null)
  const autoRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPhase(p => (p === 0 ? 1 : 0))
    }, 4000)
    skipRef.current = setTimeout(() => setShowSkip(true), 8000)
    autoRef.current = setTimeout(onFinish, 90000)

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(skipRef.current)
      clearTimeout(autoRef.current)
    }
  }, [onFinish])

  useEffect(() => {
    if (predictionReady) setShowSkip(true)
  }, [predictionReady])

  return (
    <motion.div
      className="breathe-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="breathe-title">{t('breathe', 'title')}</h2>
      <p className="breathe-sub">{t('breathe', 'subtitle')}</p>

      <div className="breathe-wrap">
        <div className="breathe-ring" />
        <div className="breathe-blob">
          <span className="breathe-text" key={phase}>
            {phase === 0 ? t('breathe', 'in') : t('breathe', 'out')}
          </span>
        </div>
        {/* Orbiting dots */}
        <div className="breathe-orbit">
          <span className="orbit-dot d1" />
          <span className="orbit-dot d2" />
          <span className="orbit-dot d3" />
        </div>
      </div>

      {showSkip && (
        <motion.button
          className="breathe-skip"
          onClick={onFinish}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {t('breathe', 'ready')} →
        </motion.button>
      )}

      <style>{`
        .breathe-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 75vh;
          padding: 40px 24px;
        }
        .breathe-title {
          font-size: 1.8rem;
          color: var(--sage-deep);
          margin-bottom: 10px;
        }
        .breathe-sub {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 48px;
        }
        .breathe-wrap {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .breathe-blob {
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg,
            rgba(244,143,177,0.3),
            rgba(206,147,216,0.35)
          );
          box-shadow:
            0 0 40px rgba(236,64,122,0.15),
            inset 0 0 30px rgba(255,255,255,0.5);
          border: 2px solid rgba(206,147,216,0.5);
          animation: breathePulse 8s ease-in-out infinite, morphBlob 12s ease-in-out infinite;
        }
        .breathe-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 1.5px dashed var(--sage-mist);
          animation: spinSlow 20s linear infinite;
        }
        .breathe-text {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--sage-deep);
          animation: fadeIn 0.6s ease;
        }
        .breathe-orbit {
          position: absolute;
          inset: 0;
          animation: spinSlow 16s linear infinite reverse;
        }
        .orbit-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sage-mist);
          opacity: 0.6;
        }
        .orbit-dot.d1 { top: 0; left: 50%; transform: translateX(-50%); }
        .orbit-dot.d2 { bottom: 12%; right: 5%; }
        .orbit-dot.d3 { bottom: 12%; left: 5%; }
        .breathe-skip {
          margin-top: 48px;
          padding: 14px 32px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, var(--terracotta), var(--terracotta-light));
          border: none;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(236,64,122,0.25);
          transition: all 0.3s var(--ease-spring);
        }
        .breathe-skip:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 28px rgba(236,64,122,0.38);
        }
      `}</style>
    </motion.div>
  )
}
