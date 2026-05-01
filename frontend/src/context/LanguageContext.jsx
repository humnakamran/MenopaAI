import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../data/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggle = useCallback(() => {
    const nextLang = lang === 'en' ? 'ur' : 'en'
    setLang(nextLang)
    
    // Trigger Google Translate programmatically
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        select.value = nextLang
        select.dispatchEvent(new Event('change'))
      }
    }, 100)
  }, [lang])

  const t = useCallback(
    (section, key) => {
      const entry = translations[section]?.[key]
      if (!entry) return key
      // Always return English as the base text for Google Translate
      return entry.en || key
    },
    []
  )

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
