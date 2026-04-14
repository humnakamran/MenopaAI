import { useLang } from '../context/LanguageContext'
import { motion } from 'framer-motion'
import heroImg from '../assets/hero-image.png'

export default function Navbar() {
  const { lang, toggle, t } = useLang()

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-brand">
        <div className="nav-img-wrap">
          <img src={heroImg} alt="MenopaAI" className="nav-img" />
        </div>
        <span className="nav-logo">{t('nav', 'brand')}</span>
      </div>

      <button className="lang-btn" onClick={toggle} title="Toggle Urdu/English">
        {lang === 'en' ? 'اردو' : 'EN'}
      </button>

      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 40px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(253, 245, 248, 0.9);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(236, 64, 122, 0.08);
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-img-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(244,143,177,0.25), rgba(206,147,216,0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-img-wrap:hover {
          transform: scale(1.1) rotate(-5deg);
        }
        .nav-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(236,64,122,0.3));
        }
        .nav-logo {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--sage-deep);
          letter-spacing: -0.03em;
        }
        .lang-btn {
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 100px;
          border: 1.5px solid rgba(236,64,122,0.3);
          background: rgba(236,64,122,0.05);
          color: var(--terracotta);
          cursor: pointer;
          transition: all 0.25s var(--ease-out-expo);
          letter-spacing: 0.02em;
        }
        .lang-btn:hover {
          background: var(--terracotta);
          color: white;
          border-color: var(--terracotta);
        }
        @media (max-width: 768px) {
          .navbar { padding: 12px 20px; }
          .nav-logo { font-size: 1.15rem; }
          .nav-img-wrap { width: 38px; height: 38px; }
          .nav-img { width: 30px; height: 30px; }
        }
      `}</style>
    </motion.nav>
  )
}
