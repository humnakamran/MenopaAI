import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../data/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggle = useCallback(() => {
    setLang(prev => (prev === 'en' ? 'ur' : 'en'))
  }, [])

  const t = useCallback(
    (section, key) => {
      const entry = translations[section]?.[key]
      if (!entry) return key
      return entry[lang] || entry.en || key
    },
    [lang]
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
