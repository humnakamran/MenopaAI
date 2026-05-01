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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="6"/>
            <path d="M12 15v7M9 19h6"/>
          </svg>
        </div>
        Menopa-AI
      </Link>
      {!minimal && (
        <>
          <div className={styles.links}>
            <a href="/#how">How it works</a>
            <Link to="/about">About</Link>
            <Link to="/research">Research</Link>
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
