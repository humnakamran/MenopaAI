import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import styles from './Results.module.css'

const getStrawStages = (stageName) => {
  const norm = (stageName || '').toLowerCase().replace('-', '')
  let currId = 'R'
  
  if (norm.includes('postmenopause') || norm.includes('post')) currId = '+1'
  else if (norm.includes('perimenopause') || norm.includes('peri')) currId = '-2'
  else if (norm.includes('late menopausal transition') || norm.includes('late mt')) currId = '-1'
  else if (norm.includes('early perimenopause') || norm.includes('early menopausal transition')) currId = '-3'
  
  return [
    { id: 'R', short: 'R', label: 'Reproductive', current: currId === 'R' },
    { id: '-3', short: '−3', label: 'Early perimenopause', current: currId === '-3' },
    { id: '-2', short: '−2', label: 'Early MT', current: currId === '-2' },
    { id: '-1', short: '−1', label: 'Late MT', current: currId === '-1' },
    { id: '+1', short: '+1', label: 'Early postmeno.', current: currId === '+1' },
    { id: '+2', short: '+2', label: 'Late postmeno.', current: currId === '+2' },
  ]
}

function SemiGauge({ value, color, riskLabel }) {
  const r = 52
  const circ = Math.PI * r
  const dash = (value / 100) * circ
  const colors = {
    pink: { stroke: '#D4537E', bg: '#F4C0D1', text: '#993556' },
    amber: { stroke: '#EF9F27', bg: '#FAC775', text: '#854F0B' },
  }
  const c = colors[color] || colors.pink
  return (
    <div className={styles.gaugeWrap}>
      <svg width="130" height="75" viewBox="0 0 130 75">
        <path d={`M 9 65 A ${r} ${r} 0 0 1 121 65`} fill="none" stroke={c.bg} strokeWidth="12" strokeLinecap="round"/>
        <path d={`M 9 65 A ${r} ${r} 0 0 1 121 65`} fill="none" stroke={c.stroke} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset="0"/>
        <text x="65" y="58" textAnchor="middle" fontSize="18" fontWeight="600" fill={c.text} fontFamily="DM Sans, sans-serif">
          {value}%
        </text>
      </svg>
      <div className={styles.gaugeLabel} style={{ color: c.text }}>{riskLabel}</div>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  
  const data = state?.data
  
  if (state?.error) {
    return <div className={styles.page} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>Backend is not responding. Please ensure your python server is running.</div>
  }
  if (!data) {
    return <div className={styles.page} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>No results available. Please fill out the assessment first.</div>
  }

  // Save to local storage for the dashboard
  localStorage.setItem('latest_assessment', JSON.stringify(data))

  const stageName = data.stage_prediction || 'Reproductive'
  const confidence = data.stage_confidence ? Math.max(...Object.values(data.stage_confidence)) : 0
  const strawStages = getStrawStages(stageName)
  const colors = ['baby-pink', 'purple', 'amber', 'pink']

  return (
    <div className={styles.page}>
      <Navbar minimal />
      <div className={styles.body}>

        <div className={styles.topRow}>
          <div className={`card ${styles.stageBadgeCard}`}>
            <div className={styles.stageLabel}>You are in</div>
            <div className={styles.stageName} style={{marginTop: '20px'}}>{stageName}</div>
            <div className={`badge badge-baby-pink`} style={{ marginTop: 20, justifyContent: 'center' }}>STRAW+10</div>
          </div>

          <div className={`card ${styles.summaryCard}`}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div className={styles.confidencePill}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#1D9E75" strokeWidth="1.2"/><path d="M4 6l1.5 1.5L8 4" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                Model confidence: <strong>{confidence}%</strong>
              </div>
            </div>
            <h2 className={styles.summaryTitle}>Your assessment is complete</h2>
            <p className={styles.summaryText}>
              Based on your responses, you are in the {stageName.toLowerCase()} stage. Your symptom severity is currently classified as <strong>{data.symptom_severity}</strong>. With the right lifestyle adjustments, many women manage their transition effectively.
            </p>
            <div className={styles.summaryActions}>
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                View my dashboard
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className={`card ${styles.timelineCard}`}>
          <h3 className={styles.sectionTitle}>Your position in the STRAW+10 journey ({stageName})</h3>
          <div className={styles.timeline}>
            {strawStages.map((s, i) => (
              <div key={s.id} className={styles.tlItem}>
                {i > 0 && <div className={`${styles.tlLine} ${strawStages.findIndex(x => x.current) >= i ? styles.tlLineDone : ''}`} />}
                <div className={`${styles.tlBubble} ${s.current ? styles.tlCurrent : strawStages.findIndex(x => x.current) > i ? styles.tlDone : ''}`}>
                  {s.short}
                </div>
                <span className={`${styles.tlLabel} ${s.current ? styles.tlLabelCurrent : ''}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.riskRow}>
          <div className={`card ${styles.riskCard}`}>
            <div className={styles.riskHeader}>
              <div className={styles.riskDot} style={{ background: '#D4537E' }} />
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Cardiovascular risk</h3>
            </div>
            <SemiGauge value={data.cardio_pct || 25} color="pink" riskLabel={`${data.cardiovascular_risk} risk`} />
          </div>

          <div className={`card ${styles.riskCard}`}>
            <div className={styles.riskHeader}>
              <div className={styles.riskDot} style={{ background: '#EF9F27' }} />
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Osteoporosis risk</h3>
            </div>
            <SemiGauge value={data.osteo_pct || 25} color="amber" riskLabel={`${data.osteoporosis_risk} risk`} />
          </div>
        </div>

        <div className={`card ${styles.recsCard}`}>
          <h3 className={styles.sectionTitle}>Personalised recommendations</h3>
          <div className={styles.recsGrid}>
            {(data.recommendations || []).map((r, idx) => (
              <div key={idx} className={styles.recGroup}>
                <div className={`badge badge-${colors[idx % colors.length]}`} style={{ marginBottom: 12 }}>{r.emoji} {r.title}</div>
                <ul className={styles.recList}>
                  <li className={styles.recItem}>
                    <div className={styles.recBullet} style={{ background: `var(--${colors[idx % colors.length]}-400)` }} />
                    <span>{r.text}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={`card ${styles.recsCard}`} style={{ marginTop: '24px' }}>
          <h3 className={styles.sectionTitle}>Physical Parameters</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--baby-pink-600)', fontFamily: 'var(--font-display)' }}>
              {data.bmi}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '500', color: 'var(--gray-900)' }}>Body Mass Index (BMI)</span>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                {data.bmi < 18.5 ? 'Underweight' : data.bmi < 25 ? 'Healthy weight range' : data.bmi < 30 ? 'Overweight' : 'Obesity range'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
