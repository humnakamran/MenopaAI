import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

const TREND_DATA = [
  { month: 'Oct', cvd: 44, bone: 29 },
  { month: 'Nov', cvd: 42, bone: 28 },
  { month: 'Dec', cvd: 40, bone: 27 },
  { month: 'Jan', cvd: 38, bone: 26 },
  { month: 'Feb', cvd: 37, bone: 25 },
  { month: 'Mar', cvd: 36, bone: 24 },
]

const HISTORY = [
  { date: 'Mar 14, 2026', stage: 'Stage −2 · Early MT', cvd: 36, bone: 24, latest: true },
  { date: 'Jan 9, 2026',  stage: 'Stage −2 · Early MT', cvd: 40, bone: 27, latest: false },
  { date: 'Oct 22, 2025', stage: 'Stage −3 · Reproductive', cvd: 44, bone: 29, latest: false },
]

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="12" height="12" rx="2"/><path d="M4 7h6M4 4.5h4M4 9.5h3" strokeLinecap="round"/></svg> },
  { id: 'history', label: 'History', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 1.5" strokeLinecap="round"/></svg> },
  { id: 'recs', label: 'Recommendations', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7 1L1 5v8h4V9h4v4h4V5L7 1z"/></svg> },
  { id: 'profile', label: 'Profile', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7" cy="5" r="3"/><path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5"/></svg> },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid var(--gray-100)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:500, marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom:2 }}>
          {p.dataKey === 'cvd' ? 'CVD risk' : 'Bone risk'}: {p.value}%
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className={styles.page}>
      <Navbar minimal />
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
            <div className={styles.userName}>{user.username}</div>
            <div className={styles.userMeta}>Track your health</div>
          </div>
          <nav className={styles.sideNav}>

            {NAV_ITEMS.map(item => (
              <button key={item.id}
                className={`${styles.sideItem} ${activeNav === item.id ? styles.sideActive : ''}`}
                onClick={() => setActiveNav(item.id)}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <button className={styles.newAssessment} onClick={() => navigate('/assessment')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New assessment
          </button>
        </aside>

        <main className={styles.main}>
          <div className={styles.statsRow}>
            {[
              { val: 'Stage −2', label: 'Current STRAW stage', color: 'var(--baby-pink-400)' },
              { val: '36%', label: 'CVD risk score', color: 'var(--pink-400)' },
              { val: '24%', label: 'Osteoporosis risk', color: 'var(--amber-400)' },
              { val: '3', label: 'Total assessments', color: 'var(--purple-400)' },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statNum} style={{ color: s.color }}>{s.val}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className={`card ${styles.chartCard}`}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Risk score trend</h3>
              <div className={styles.chartLegend}>
                <span><span className={styles.legendDot} style={{ background:'#D4537E' }}/> CVD</span>
                <span><span className={styles.legendDot} style={{ background:'#EF9F27' }}/> Bone</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={TREND_DATA} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--gray-400)', fontFamily:'DM Sans' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)', fontFamily:'DM Sans' }} axisLine={false} tickLine={false} domain={[15, 55]}/>
                <Tooltip content={<CustomTooltip />}/>
                <Line type="monotone" dataKey="cvd" stroke="#D4537E" strokeWidth={2} dot={false} activeDot={{ r: 4, fill:'#D4537E' }}/>
                <Line type="monotone" dataKey="bone" stroke="#EF9F27" strokeWidth={2} dot={false} activeDot={{ r: 4, fill:'#EF9F27' }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`card ${styles.historyCard}`}>
            <h3 className={styles.chartTitle}>Past assessments</h3>
            <div className={styles.histList}>
              {HISTORY.map((h, i) => (
                <div key={i} className={`${styles.histItem} ${h.latest ? styles.histLatest : ''}`}
                  onClick={() => navigate('/results')}>
                  <div className={styles.histDate}>{h.date}</div>
                  <div className={`badge ${h.latest ? 'badge-baby-pink' : ''}`} style={!h.latest ? { background:'var(--gray-100)', color:'var(--gray-600)' } : {}}>
                    {h.stage}
                  </div>
                  <div className={styles.histRisks}>
                    <span style={{ color:'var(--pink-600)' }}>CVD {h.cvd}%</span>
                    <span style={{ color:'var(--gray-400)' }}>·</span>
                    <span style={{ color:'var(--amber-600)' }}>Bone {h.bone}%</span>
                  </div>
                  {h.latest && <span className={`badge badge-baby-pink`} style={{ fontSize:11, padding:'3px 8px' }}>Latest</span>}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color:'var(--gray-400)' }}><path d="M5 3.5L9 7l-4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
