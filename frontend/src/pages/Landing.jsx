import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import styles from './Landing.module.css'

const STAGES = [
  { id: 'R', label: 'Reproductive', angle: -90 },
  { id: '-3', label: 'Early perimenopause', angle: -36 },
  { id: '-2', label: 'Early MT', angle: 18 },
  { id: '-1', label: 'Late MT', angle: 72 },
  { id: '+1', label: 'Early postmeno.', angle: 126 },
  { id: '+2', label: 'Late postmeno.', angle: 180 },
]

const FEATURES = [
  {
    color: 'baby-pink',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 9h8M5 6h5.5M5 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: 'STRAW+10 staging',
    desc: 'Clinically validated 5-stage classification based on your menstrual and hormonal history, aligned to international standards.',
  },
  {
    color: 'pink',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: 'CVD risk prediction',
    desc: 'Cardiovascular disease risk score tailored to Pakistani women — accounting for local dietary, genetic, and lifestyle factors.',
  },
  {
    color: 'amber',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L5.5 7h2.5v3L5 11.5l4 4.5 4-4.5-3-1.5V7H13L9 2z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Osteoporosis risk',
    desc: 'Bone density risk analysis with calcium, vitamin D, and weight-bearing exercise recommendations.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={`badge badge-baby-pink ${styles.heroBadge}`}>
            <span className={styles.badgeDot} />
            AI-powered · Designed for Pakistani women
          </div>
          <h1 className={styles.heroTitle}>
            Understand your<br />
            <em>menopause journey</em><br />
            with confidence
          </h1>
          <p className={styles.heroSub}>
            Take a 10-minute health assessment. Get your STRAW+10 stage,
            cardiovascular risk score, and a personalised lifestyle plan —
            available in Urdu and English.
          </p>
          <div className={styles.heroActions}>
            <button className="btn-primary" onClick={() => navigate('/assessment')}>
              Begin assessment
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn more
            </button>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.ringWrap} style={{ position: 'relative' }}>
            <svg width="260" height="260" viewBox="0 0 240 240" 
                 style={{ filter: 'drop-shadow(0 15px 35px rgba(212, 83, 126, 0.25))', transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer' }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
              <defs>
                <linearGradient id="shinyPink" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBCFE8" />
                  <stop offset="50%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#BE185D" />
                </linearGradient>
                <filter id="pinkGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              <circle cx="120" cy="120" r="96" fill="none" stroke="#FDF2F8" strokeWidth="20"/>
              <circle cx="120" cy="120" r="96" fill="none" stroke="url(#shinyPink)" strokeWidth="20"
                strokeDasharray="220 382" strokeLinecap="round"
                style={{ transformOrigin: 'center', animation: 'spinPulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate', filter: 'url(#pinkGlow)' }}/>
              <circle cx="120" cy="120" r="76" fill="#fff"/>
              
              <text x="120" y="105" textAnchor="middle" fontSize="11" fill="#888780" fontFamily="DM Sans, sans-serif">Current stage</text>
              <text x="120" y="130" textAnchor="middle" fontSize="20" fontWeight="700" fill="#BE185D" fontFamily="DM Sans, sans-serif">Early MT</text>
              <text x="120" y="148" textAnchor="middle" fontSize="11" fontWeight="600" fill="#F472B6" fontFamily="DM Sans, sans-serif">STRAW +10  ·  Stage −2</text>
            </svg>
            <style>{`
              @keyframes spinPulse {
                0% { stroke-dasharray: 180 600; transform: rotate(-110deg); }
                100% { stroke-dasharray: 280 600; transform: rotate(-70deg); }
              }
            `}</style>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        {[
          { num: '5', label: 'Menopause stages tracked', color: 'baby-pink' },
          { num: '2', label: 'ML risk models', color: 'purple' },
          { num: '10 min', label: 'Average assessment', color: 'amber' },
          { num: 'اردو', label: 'Full Urdu support', color: 'pink' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statNum} style={{ color: `var(--${s.color}-400)` }}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      <section className={styles.features} id="how">
        <div className={styles.featuresHeader}>
          <div className="badge badge-baby-pink">How it works</div>
          <h2 className={styles.featuresTitle}>Three models. One comprehensive picture.</h2>
        </div>
        <div className={styles.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={`card ${styles.featCard}`}>
              <div className={styles.featIcon} style={{ background: `var(--${f.color}-50)`, color: `var(--${f.color}-600)` }}>
                {f.icon}
              </div>
              <h3 className={styles.featTitle}>{f.title}</h3>
              <p className={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to understand your health?</h2>
          <p className={styles.ctaSub}>Free to use. Takes 10 minutes. Results are instant.</p>
          <button className="btn-primary" onClick={() => navigate('/assessment')} style={{ fontSize: '15px', padding: '13px 28px' }}>
            Start your free assessment
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.logo} style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:'600', fontSize:'15px' }}>
          <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--baby-pink-400)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="9" r="6"/>
              <path d="M12 15v7M9 19h6"/>
            </svg>
          </div>
          Menopa-AI
        </div>
        <p className={styles.footerNote}>Final year project · BS Bioinformatics · 2026</p>
      </footer>
    </div>
  )
}
