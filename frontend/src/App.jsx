import { useState, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LanguageProvider } from './context/LanguageContext'
import { predictHealth } from './api'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Questionnaire from './components/Questionnaire/Questionnaire'
import BreathingScreen from './components/BreathingScreen'
import ResultsDashboard from './components/Results/ResultsDashboard'
import Chatbot from './components/Chatbot'

const SCREENS = { WELCOME: 'welcome', FORM: 'form', BREATHING: 'breathing', RESULTS: 'results' }

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME)
  const [predictionData, setPredictionData] = useState(null)
  const [payload, setPayload] = useState(null)
  const [predictionReady, setPredictionReady] = useState(false)
  const reportRef = useRef(null)
  const predRef = useRef(null)

  const handleStart = useCallback(() => {
    setScreen(SCREENS.FORM)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSubmit = useCallback(async (formPayload) => {
    setPayload(formPayload)
    setScreen(SCREENS.BREATHING)
    setPredictionReady(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const data = await predictHealth(formPayload)
      predRef.current = data
      setPredictionReady(true)
    } catch (e) {
      console.error('Backend offline:', e)
      predRef.current = null
      setPredictionReady(true)
    }
  }, [])

  const handleFinishBreathing = useCallback(() => {
    const data = predRef.current
    if (data?.status === 'success') {
      setPredictionData(data)
    } else {
      setPredictionData(null)
    }
    setScreen(SCREENS.RESULTS)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleRestart = useCallback(() => {
    setPredictionData(null)
    setPayload(null)
    setPredictionReady(false)
    predRef.current = null
    setScreen(SCREENS.WELCOME)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    const el = reportRef.current
    if (!el) return

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(el, { scale: 1.5, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width

      let yPos = 0
      while (yPos < imgH) {
        if (yPos > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -yPos, pageW, imgH)
        yPos += pageH
      }

      const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
      pdf.save(`MenopaAI_Report_${date}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
      alert('PDF generation failed. Please try again.')
    }
  }, [])

  return (
    <LanguageProvider>
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          {screen === SCREENS.WELCOME && (
            <HeroSection key="hero" onStart={handleStart} />
          )}
          {screen === SCREENS.FORM && (
            <Questionnaire
              key="form"
              onSubmit={handleSubmit}
              onBack={() => {
                setScreen(SCREENS.WELCOME)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          )}
          {screen === SCREENS.BREATHING && (
            <BreathingScreen
              key="breathe"
              onFinish={handleFinishBreathing}
              predictionReady={predictionReady}
            />
          )}
          {screen === SCREENS.RESULTS && (
            <ResultsDashboard
              key="results"
              data={predictionData}
              payload={payload}
              onRestart={handleRestart}
              onDownloadPdf={handleDownloadPdf}
              reportRef={reportRef}
            />
          )}
        </AnimatePresence>
      </main>

      <Chatbot predictions={predictionData} />
    </LanguageProvider>
  )
}
