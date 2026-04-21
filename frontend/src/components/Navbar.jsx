import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar({ minimal = false }) {
  const navigate = useNavigate()
  const { lang, toggle } = useLang()
  const { user, logout } = useAuth()

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <div className={styles.logoDot}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="3" fill="#fff"/>
            <path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        MenoTrack
      </Link>
      {!minimal && (
        <>
          <div className={styles.links}>
            <a href="#how">How it works</a>
            <a href="#about">About</a>
            <a href="#research">Research</a>
          </div>
          <div className={styles.actions}>
            <button onClick={toggle} className="btn-ghost" style={{ fontSize: '15px', fontWeight: 600, padding: '4px 8px' }}>
              {lang === 'en' ? 'اردو' : 'EN'}
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="btn-ghost" style={{ fontWeight: 600 }}>{user.username}</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost">Sign in</Link>
            )}
            <button className="btn-primary" onClick={() => navigate('/assessment')}>
              Start assessment
            </button>
          </div>
        </>
      )}
      {minimal && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={toggle} className="btn-ghost" style={{ fontSize: '15px', fontWeight: 600, padding: '4px 8px' }}>
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <Link to="/" className={styles.exit}>Save &amp; exit</Link>
        </div>
      )}
    </nav>
  )
}
