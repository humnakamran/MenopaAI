import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { chatMessage } from '../api'

export default function Chatbot({ predictions }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: t('chat', 'greeting') },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const msgsRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [messages])

  const send = async () => {
    const msg = input.trim()
    if (!msg || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setSending(true)

    try {
      const data = await chatMessage(msg, predictions)
      setMessages(prev => [...prev, { role: 'bot', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: t('chat', 'offline') }])
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') send()
  }

  return (
    <div className="chatbot-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="chat-header">
              <span>🌿 {t('chat', 'title')}</span>
              <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="chat-messages" ref={msgsRef}>
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.role === 'bot' && <span className="chat-avatar">🌿</span>}
                  <div
                    className="chat-bubble"
                    dangerouslySetInnerHTML={{
                      __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                </div>
              ))}
              {sending && (
                <div className="chat-msg bot">
                  <span className="chat-avatar">🌿</span>
                  <div className="chat-bubble typing">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={t('chat', 'placeholder')}
              />
              <button className="chat-send" onClick={send} disabled={sending}>➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="chat-fab" onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '💬'}
      </button>

      <style>{`
        .chatbot-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
        }
        .chat-fab {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--pink-400), var(--baby-pink-400));
          color: white;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(212, 83, 126, 0.35);
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-fab:hover { transform: scale(1.08); }
        .chat-panel {
          position: absolute;
          bottom: 72px;
          right: 0;
          width: 340px;
          height: 460px;
          background: var(--gray-50);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-100);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform-origin: bottom right;
        }
        .chat-header {
          background: linear-gradient(135deg, var(--pink-600), var(--baby-pink-400));
          color: white;
          padding: 14px 18px;
          font-weight: 600;
          font-size: 0.92rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .chat-close:hover { opacity: 1; }
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chat-msg {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .chat-msg.user { flex-direction: row-reverse; }
        .chat-avatar { font-size: 1.1rem; }
        .chat-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.85rem;
          line-height: 1.45;
        }
        .chat-msg.bot .chat-bubble {
          background: var(--pink-50);
          border-bottom-left-radius: 4px;
          color: var(--gray-900);
        }
        .chat-msg.user .chat-bubble {
          background: var(--pink-400);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .typing {
          display: flex;
          gap: 4px;
          padding: 12px 18px;
        }
        .typing .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--baby-pink-100);
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        .typing .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        .chat-input-row {
          padding: 12px;
          border-top: 1px solid var(--baby-pink-50);
          display: flex;
          gap: 8px;
          background: rgba(255,255,255,0.6);
        }
        .chat-input-row input {
          flex: 1;
          padding: 10px 14px;
          border: 1.5px solid var(--baby-pink-50);
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 0.85rem;
          outline: none;
          background: white;
          color: var(--gray-900);
        }
        .chat-input-row input:focus { border-color: var(--pink-400); }
        .chat-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--pink-400);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .chat-send:hover { background: var(--pink-600); }
        .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 480px) {
          .chatbot-widget { bottom: 14px; right: 14px; }
          .chat-panel {
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            width: auto;
            height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  )
}
