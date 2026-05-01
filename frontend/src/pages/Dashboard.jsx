import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

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
  const [latestData, setLatestData] = useState(null)
  const [historyList, setHistoryList] = useState([])
  const [profile, setProfile] = useState({ age: '', height: '', weight: '', goal: '' })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('latest_assessment')
      if (stored) {
        setLatestData(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }

    if (user) {
      fetch(`http://127.0.0.1:5000/history?username=${user.username}`)
        .then(r => r.json())
        .then(d => {
          if (d.history) setHistoryList(d.history)
        })
        .catch(console.error)

      fetch(`http://127.0.0.1:5000/profile?username=${user.username}`)
        .then(r => r.json())
        .then(d => {
          if (d.profile && (d.profile.age || d.profile.goal || d.profile.height || d.profile.weight)) {
            setProfile(d.profile)
            setIsEditingProfile(false)
          } else {
            setIsEditingProfile(true)
          }
        })
        .catch(console.error)
    }
  }, [user])

  const handleProfileSave = (e) => {
    e.preventDefault()
    fetch('http://127.0.0.1:5000/profile', {
      method: 'POST',
      body: JSON.stringify({ ...profile, username: user.username })
    }).then(() => {
      setIsEditingProfile(false)
    }).catch(err => {
      console.error(err)
      alert("Failed to save profile. Is the backend running?")
    })
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // Map dynamic trend data from history (limit to oldest to newest)
  const trendData = [...historyList].reverse().map(h => ({
    month: h.date.split(' ')[0], // e.g., 'May'
    cvd: h.cvd,
    bone: h.bone
  }))

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
          {activeNav === 'dashboard' && (
            <>
              <div className={styles.statsRow}>
                {[
                  { val: latestData ? latestData.stage_prediction : 'Unknown', label: 'Current STRAW stage', color: 'var(--baby-pink-400)' },
                  { val: latestData ? `${latestData.cardio_pct}%` : 'N/A', label: 'CVD risk score', color: 'var(--pink-400)' },
                  { val: latestData ? `${latestData.osteo_pct}%` : 'N/A', label: 'Osteoporosis risk', color: 'var(--amber-400)' },
                  { val: historyList.length.toString(), label: 'Total assessments', color: 'var(--purple-400)' },
                ].map(s => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statNum} style={{ color: s.color, fontSize: '24px' }}>{s.val}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {trendData.length > 0 && (
                <div className={`card ${styles.chartCard}`}>
                  <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Risk score trend</h3>
                    <div className={styles.chartLegend}>
                      <span><span className={styles.legendDot} style={{ background:'#D4537E' }}/> CVD</span>
                      <span><span className={styles.legendDot} style={{ background:'#EF9F27' }}/> Bone</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false}/>
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--gray-400)', fontFamily:'DM Sans' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)', fontFamily:'DM Sans' }} axisLine={false} tickLine={false} domain={[0, 100]}/>
                      <Tooltip content={<CustomTooltip />}/>
                      <Line type="monotone" dataKey="cvd" stroke="#D4537E" strokeWidth={2} dot={true} activeDot={{ r: 4, fill:'#D4537E' }}/>
                      <Line type="monotone" dataKey="bone" stroke="#EF9F27" strokeWidth={2} dot={true} activeDot={{ r: 4, fill:'#EF9F27' }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className={`card ${styles.historyCard}`}>
                <h3 className={styles.chartTitle}>Recent assessments</h3>
                <div className={styles.histList}>
                  {historyList.length > 0 ? historyList.slice(0, 3).map((h, i) => (
                    <div key={i} className={`${styles.histItem} ${i === 0 ? styles.histLatest : ''}`}
                      onClick={() => navigate('/results', { state: { data: h.full_data } })}>
                      <div className={styles.histDate}>{h.date}</div>
                      <div className={`badge ${i === 0 ? 'badge-baby-pink' : ''}`} style={i !== 0 ? { background:'var(--gray-100)', color:'var(--gray-600)' } : {}}>
                        {h.stage}
                      </div>
                      <div className={styles.histRisks}>
                        <span style={{ color:'var(--pink-600)' }}>CVD {h.cvd}%</span>
                        <span style={{ color:'var(--gray-400)' }}>·</span>
                        <span style={{ color:'var(--amber-600)' }}>Bone {h.bone}%</span>
                      </div>
                      {i === 0 && <span className={`badge badge-baby-pink`} style={{ fontSize:11, padding:'3px 8px' }}>Latest</span>}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color:'var(--gray-400)' }}><path d="M5 3.5L9 7l-4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>No assessments taken yet.</p>
                  )}
                </div>
                {historyList.length > 3 && (
                  <button onClick={() => setActiveNav('history')} className="btn-ghost" style={{ width: '100%', marginTop: '10px' }}>View full history</button>
                )}
              </div>
            </>
          )}

          {activeNav === 'recs' && (
            <div className={`card`} style={{ padding: '30px' }}>
              <h3 className={styles.chartTitle} style={{ marginBottom: '24px', fontSize: '20px' }}>Your Personalised Recommendations</h3>
              {latestData && latestData.recommendations && latestData.recommendations.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  {latestData.recommendations.map((r, idx) => {
                    const colors = ['baby-pink', 'purple', 'amber', 'pink']
                    const color = colors[idx % colors.length]
                    return (
                      <div key={idx} style={{ background: 'var(--gray-50)', padding: '24px', borderRadius: '16px', border: `1px solid var(--${color}-200)`, display: 'flex', flexDirection: 'column' }}>
                        <div className={`badge badge-${color}`} style={{ marginBottom: '14px', display: 'inline-flex', fontSize: '13px', alignSelf: 'flex-start' }}>
                          {r.emoji} {r.title}
                        </div>
                        <p style={{ fontSize: '15px', color: 'var(--gray-900)', fontWeight: '600', lineHeight: '1.4', marginBottom: '12px' }}>
                          {r.text}
                        </p>
                        {r.details && (
                          <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '18px', flex: 1 }}>
                            {r.details}
                          </p>
                        )}
                        {r.link_url && (
                          <a href={r.link_url} target="_blank" rel="noopener noreferrer" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: '600', color: `var(--${color}-600)`, textDecoration: 'none', marginTop: 'auto', padding: '10px 14px', background: `var(--${color}-50)`, borderRadius: '8px', transition: 'opacity 0.2s' }}>
                            Read article 
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-500)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '20px', color: 'var(--baby-pink-400)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <h4 style={{ color: 'var(--gray-900)', marginBottom: '10px', fontSize: '18px' }}>No recommendations yet</h4>
                  <p style={{ fontSize: '15px' }}>Complete your health assessment to unlock personalized diet, lifestyle, and medical tracking advice.</p>
                  <button className="btn-primary" onClick={() => navigate('/assessment')} style={{ marginTop: '20px' }}>Start Assessment</button>
                </div>
              )}
            </div>
          )}

          {activeNav === 'history' && (
            <div className={`card`} style={{ padding: '30px' }}>
              <h3 className={styles.chartTitle} style={{ marginBottom: '24px', fontSize: '20px' }}>Assessment History</h3>
              <div className={styles.histList}>
                {historyList.map((h, i) => (
                  <div key={i} className={`${styles.histItem} ${i === 0 ? styles.histLatest : ''}`}
                    onClick={() => navigate('/results', { state: { data: h.full_data } })}>
                    <div className={styles.histDate}>{h.date}</div>
                    <div className={`badge ${i === 0 ? 'badge-baby-pink' : ''}`} style={i !== 0 ? { background:'var(--gray-100)', color:'var(--gray-600)' } : {}}>
                      {h.stage}
                    </div>
                    <div className={styles.histRisks}>
                      <span style={{ color:'var(--pink-600)' }}>CVD {h.cvd}%</span>
                      <span style={{ color:'var(--gray-400)' }}>·</span>
                      <span style={{ color:'var(--amber-600)' }}>Bone {h.bone}%</span>
                    </div>
                    {i === 0 && <span className={`badge badge-baby-pink`} style={{ fontSize:11, padding:'3px 8px' }}>Latest</span>}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color:'var(--gray-400)' }}><path d="M5 3.5L9 7l-4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ))}
                {historyList.length === 0 && <p style={{ color: 'var(--gray-500)' }}>No history available.</p>}
              </div>
            </div>
          )}

          {activeNav === 'profile' && !isEditingProfile && (
             <div className={`card`} style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--baby-pink-100)', color: 'var(--baby-pink-600)', fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                 {user.username.charAt(0).toUpperCase()}
               </div>
               <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gray-900)', marginBottom: '8px' }}>{user.username}</h3>
               <p style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '30px' }}>Your Health Profile</p>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray-100)' }}>
                     <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Age</div>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gray-900)' }}>{profile.age || '--'}</div>
                  </div>
                  <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray-100)' }}>
                     <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Height</div>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gray-900)' }}>{profile.height ? `${profile.height} cm` : '--'}</div>
                  </div>
                  <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray-100)' }}>
                     <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Weight</div>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gray-900)' }}>{profile.weight ? `${profile.weight} kg` : '--'}</div>
                  </div>
               </div>

               {profile.goal && (
                 <div style={{ background: 'var(--baby-pink-50)', padding: '24px', borderRadius: '16px', textAlign: 'left', marginBottom: '30px', border: '1px solid var(--baby-pink-100)' }}>
                   <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--baby-pink-600)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Primary Health Goal</div>
                   <p style={{ color: 'var(--gray-800)', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>{profile.goal}</p>
                 </div>
               )}

               <button onClick={() => setIsEditingProfile(true)} className="btn-ghost" style={{ border: '1px solid var(--gray-200)', padding: '10px 24px', borderRadius: '8px', fontWeight: '600' }}>Edit Profile</button>
             </div>
          )}

          {activeNav === 'profile' && isEditingProfile && (
            <div className={`card`} style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
              <h3 className={styles.chartTitle} style={{ marginBottom: '24px', fontSize: '20px' }}>Edit Profile</h3>
              <form onSubmit={handleProfileSave}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Age</label>
                      <input type="number" value={profile.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '15px', fontFamily: 'inherit', background: 'var(--gray-50)' }} placeholder="e.g. 45" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Height (cm)</label>
                      <input type="number" value={profile.height || ''} onChange={e => setProfile({...profile, height: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '15px', fontFamily: 'inherit', background: 'var(--gray-50)' }} placeholder="e.g. 165" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Weight (kg)</label>
                      <input type="number" value={profile.weight || ''} onChange={e => setProfile({...profile, weight: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '15px', fontFamily: 'inherit', background: 'var(--gray-50)' }} placeholder="e.g. 68" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Primary Health Goal</label>
                      <textarea value={profile.goal || ''} onChange={e => setProfile({...profile, goal: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '15px', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical', background: 'var(--gray-50)' }} placeholder="e.g. Manage hot flashes, improve bone density..."></textarea>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                   <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>Save Changes</button>
                   <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-ghost" style={{ padding: '14px 24px', border: '1px solid var(--gray-200)' }}>Cancel</button>
                 </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
