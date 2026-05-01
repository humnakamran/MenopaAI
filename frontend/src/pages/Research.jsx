import Navbar from '../components/Navbar'

export default function Research() {
  return (
    <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 80px' }}>
         <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--gray-900)', textAlign: 'center', marginBottom: '24px', letterSpacing: '-0.5px' }}>
           Our <span style={{ color: 'var(--purple-600)' }}>Clinical Foundation</span>
         </h1>
         <p style={{ fontSize: '18px', color: 'var(--gray-600)', textAlign: 'center', lineHeight: '1.6', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
           Menopa-AI's predictive models are built upon established medical research and validated clinical staging systems.
         </p>

         <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--gray-900)', marginBottom: '16px', fontWeight: '700' }}>The STRAW+10 Staging System</h2>
            <p style={{ fontSize: '16px', color: 'var(--gray-700)', lineHeight: '1.7', marginBottom: '20px' }}>
              The Stages of Reproductive Aging Workshop (STRAW) + 10 criteria is the gold standard for evaluating reproductive aging in women. Menopa-AI leverages this globally recognized framework to accurately map your current phase based on menstrual cycle changes, age, and vasomotor symptoms.
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--gray-700)', fontSize: '16px', lineHeight: '1.7' }}>
              <li style={{ marginBottom: '10px' }}><strong>Pre-menopause:</strong> Regular cycles, stable hormones.</li>
              <li style={{ marginBottom: '10px' }}><strong>Perimenopause (MT):</strong> Variable cycle lengths, emergence of hot flashes.</li>
              <li style={{ marginBottom: '10px' }}><strong>Post-menopause:</strong> Complete cessation of menstrual cycles for over 12 months.</li>
            </ul>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', borderTop: '4px solid var(--pink-400)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
               <h3 style={{ fontSize: '18px', color: 'var(--gray-900)', marginBottom: '12px', fontWeight: '700' }}>Cardiovascular Risk</h3>
               <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', margin: 0 }}>The decline in estrogen during menopause significantly increases cardiovascular disease (CVD) risk. Our algorithms factor in BMI, smoking history, stress levels, and family history to provide a dynamic baseline risk percentage.</p>
            </div>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', borderTop: '4px solid var(--amber-400)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
               <h3 style={{ fontSize: '18px', color: 'var(--gray-900)', marginBottom: '12px', fontWeight: '700' }}>Osteoporosis Prediction</h3>
               <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', margin: 0 }}>Bone density rapidly decreases during the menopausal transition. We evaluate age, calcium/Vitamin D intake, physical activity, and prior DEXA scan results to predict bone mineral density deterioration.</p>
            </div>
         </div>
      </div>
    </div>
  )
}
