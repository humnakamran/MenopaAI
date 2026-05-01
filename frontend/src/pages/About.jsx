import Navbar from '../components/Navbar'

export default function About() {
  return (
    <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 80px' }}>
         <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--gray-900)', textAlign: 'center', marginBottom: '24px', letterSpacing: '-0.5px' }}>
           Demystifying Menopause, <span style={{ color: 'var(--baby-pink-600)' }}>Together</span>.
         </h1>
         <p style={{ fontSize: '18px', color: 'var(--gray-600)', textAlign: 'center', lineHeight: '1.6', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
           Menopa-AI is a data-driven companion designed to empower women navigating the complexities of perimenopause and menopause.
         </p>

         <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--gray-900)', marginBottom: '16px', fontWeight: '700' }}>Our Mission</h2>
            <p style={{ fontSize: '16px', color: 'var(--gray-700)', lineHeight: '1.7', marginBottom: '20px' }}>
              For too long, women's health—specifically the menopausal transition—has been under-researched, misunderstood, and stigmatized. Many women experience severe symptoms ranging from hot flashes and joint pain to cardiovascular and bone density risks, often without adequate guidance or personalized care.
            </p>
            <p style={{ fontSize: '16px', color: 'var(--gray-700)', lineHeight: '1.7' }}>
              Our mission is to bridge that gap. By leveraging advanced analytics and established clinical guidelines (like the STRAW+10 staging system), we provide highly personalized, stage-specific health insights that are accessible to everyone, regardless of their medical background.
            </p>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', borderTop: '4px solid var(--pink-400)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
               <h3 style={{ fontSize: '18px', color: 'var(--gray-900)', marginBottom: '12px', fontWeight: '700' }}>Clinical Accuracy</h3>
               <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', margin: 0 }}>We utilize rule-based clinical scoring and deterministic models to accurately predict cardiovascular and osteoporosis risks tailored to your specific menopausal stage.</p>
            </div>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', borderTop: '4px solid var(--amber-400)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
               <h3 style={{ fontSize: '18px', color: 'var(--gray-900)', marginBottom: '12px', fontWeight: '700' }}>Empowering Education</h3>
               <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', margin: 0 }}>Understanding your body shouldn't require a medical degree. We curate easy-to-understand recommendations linked to trusted medical resources to help you take control of your health.</p>
            </div>
         </div>
      </div>
    </div>
  )
}
