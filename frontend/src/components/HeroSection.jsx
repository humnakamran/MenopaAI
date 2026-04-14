import { useRef } from 'react'
import { useLang } from '../context/LanguageContext'
import { motion } from 'framer-motion'
import heroImg from '../assets/hero-image.png'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}
const fadeLeft = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
}

export default function HeroSection({ onStart }) {
  const { t } = useLang()
  const imgRef = useRef(null)

  const handleMouseMove = (e) => {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    const tx = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 14
    const ty = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -14
    img.style.transform = `perspective(1000px) rotateX(${ty}deg) rotateY(${tx}deg) scale(1.06)`
  }

  const handleMouseLeave = () => {
    const img = imgRef.current
    if (img) img.style.transform = ''
  }

  return (
    <section className="hero-section">
      {/* Floating stat left */}
      <motion.div
        className="hero-float-card"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <strong className="float-val">92%</strong>
        <span className="float-label">{t('hero', 'stat1')}</span>
      </motion.div>

      {/* Center image */}
      <motion.div
        className="hero-image-wrap"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-img-glow" />
        <img
          ref={imgRef}
          src={heroImg}
          alt="Female reproductive health illustration"
          className="hero-img"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </motion.div>

      {/* Right stat cluster */}
      <motion.div
        className="hero-stat-cluster"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="stat-mini pink">
          <strong>{t('hero', 'indicatorsVal')}</strong>
          <span>{t('hero', 'indicators')}</span>
        </div>
        <div className="stat-mini white">
          <strong>{t('hero', 'riskPredVal')}</strong>
          <span>{t('hero', 'riskPred')}</span>
        </div>
        <div className="stat-mini purple">
          <strong>{t('hero', 'samplesVal')}</strong>
          <span>{t('hero', 'samples')}</span>
        </div>
      </motion.div>

      {/* Headline + CTA below image */}
      <motion.div
        className="hero-headline-wrap"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1 className="hero-headline" variants={fadeUp}>
          {t('hero', 'headline')} 💗
        </motion.h1>
        <motion.p className="hero-subtext" variants={fadeUp}>
          {t('hero', 'subtext')}
        </motion.p>
        <motion.button className="hero-cta" onClick={onStart} variants={fadeUp}>
          <span className="cta-shine" />
          ✨ {t('hero', 'cta')}
        </motion.button>
      </motion.div>

      <style>{`
        .hero-section {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          grid-template-rows: auto auto;
          align-items: center;
          justify-items: center;
          gap: 20px 32px;
          padding: 50px 48px 70px;
          position: relative;
          overflow: hidden;
          min-height: 84vh;
        }

        /* floating left card */
        .hero-float-card {
          grid-column: 1;
          grid-row: 1;
          justify-self: end;
          display: flex;
          flex-direction: column;
          padding: 22px 26px;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: var(--radius-lg);
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(12px);
          gap: 4px;
          max-width: 190px;
        }
        .float-val {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--terracotta);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .float-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
          line-height: 1.3;
        }

        /* center image */
        .hero-image-wrap {
          grid-column: 2;
          grid-row: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-img-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(ellipse at center,
            rgba(244,143,177,0.35) 0%,
            rgba(206,147,216,0.15) 50%,
            transparent 70%
          );
          border-radius: 50%;
          animation: floatGentle 6s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-img {
          width: 280px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 8px 32px rgba(236,64,122,0.35));
          transition: transform 0.15s ease-out, filter 0.3s ease;
          transform-style: preserve-3d;
          cursor: pointer;
          will-change: transform;
        }
        .hero-img:hover {
          filter: drop-shadow(0 12px 48px rgba(236,64,122,0.6));
        }

        /* right stat cluster */
        .hero-stat-cluster {
          grid-column: 3;
          grid-row: 1;
          justify-self: start;
          display: grid;
          grid-template-columns: auto auto;
          gap: 12px;
          align-items: center;
        }
        .stat-mini {
          padding: 14px 16px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 100px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: var(--card-shadow);
          transition: transform 0.3s var(--ease-spring);
        }
        .stat-mini:hover { transform: translateY(-4px); }
        .stat-mini strong {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .stat-mini span {
          font-size: 0.74rem;
          font-weight: 500;
          line-height: 1.3;
        }
        .stat-mini.pink {
          background: linear-gradient(135deg, #F48FB1, #EC407A);
          color: white;
          grid-column: 1;
          grid-row: 1 / span 2;
          justify-self: end;
          align-self: center;
        }
        .stat-mini.white {
          background: rgba(255,255,255,0.8);
          color: var(--sage-deep);
          grid-column: 2;
          grid-row: 1;
        }
        .stat-mini.purple {
          background: linear-gradient(135deg, #CE93D8, #8E24AA);
          color: white;
          grid-column: 2;
          grid-row: 2;
        }

        /* headline below */
        .hero-headline-wrap {
          grid-column: 1 / -1;
          grid-row: 2;
          text-align: center;
          padding-top: 8px;
        }
        .hero-headline {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: var(--sage-deep);
          margin-bottom: 10px;
          letter-spacing: -0.03em;
        }
        .hero-subtext {
          font-size: 1.05rem;
          font-weight: 400;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }
        .hero-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 38px;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, var(--terracotta), var(--terracotta-light));
          border: none;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 22px rgba(236, 64, 122, 0.35);
          transition: all 0.3s var(--ease-spring);
          overflow: hidden;
          letter-spacing: 0.01em;
        }
        .cta-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-cta:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 32px rgba(236, 64, 122, 0.5);
          background: linear-gradient(135deg, var(--terracotta-dark), var(--terracotta));
        }
        .hero-cta:active {
          transform: translateY(1px) scale(0.98);
        }

        /* tablet */
        @media (max-width: 1100px) {
          .hero-section { padding: 36px 28px 52px; gap: 14px 20px; }
          .hero-img { width: 210px; }
          .hero-float-card { padding: 16px 18px; max-width: 155px; }
          .float-val { font-size: 1.6rem; }
          .stat-mini strong { font-size: 1.25rem; }
          .stat-mini span { font-size: 0.7rem; }
          .stat-mini { min-width: 88px; padding: 12px 13px; }
        }

        /* mobile — stack vertically */
        @media (max-width: 700px) {
          .hero-section {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto auto;
            padding: 32px 20px 52px;
            gap: 20px;
            min-height: unset;
          }
          .hero-image-wrap {
            grid-column: 1;
            grid-row: 1;
            order: -1;
          }
          .hero-img { width: 210px; }
          .hero-img-glow { inset: -10px; }
          .hero-float-card {
            grid-column: 1;
            grid-row: 2;
            justify-self: center;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            max-width: 90%;
            width: 100%;
          }
          .hero-stat-cluster {
            grid-column: 1;
            grid-row: 3;
            justify-self: center;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
          }
          .stat-mini.pink { grid-column: auto; grid-row: auto; }
          .stat-mini.white { grid-column: auto; grid-row: auto; }
          .stat-mini.purple { grid-column: auto; grid-row: auto; }
          .hero-headline-wrap {
            grid-column: 1;
            grid-row: 4;
          }
          .hero-cta { width: 100%; justify-content: center; }
          .hero-headline { font-size: 1.8rem; }
        }

        @media (max-width: 420px) {
          .hero-img { width: 160px; }
          .hero-headline { font-size: 1.5rem; }
        }
      `}</style>
    </section>
  )
}
