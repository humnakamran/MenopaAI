import { useLang } from '../../context/LanguageContext'

export default function ProgressFlower({ currentStep }) {
  const { t } = useLang()
  const petalColors = [
    currentStep >= 2 ? 'var(--terracotta)' : 'var(--terracotta-wash)',
    currentStep >= 4 ? 'var(--terracotta)' : 'var(--terracotta-wash)',
    currentStep >= 6 ? 'var(--terracotta)' : 'var(--terracotta-wash)',
    currentStep >= 7 ? 'var(--terracotta)' : 'var(--terracotta-wash)',
  ]
  const petalOpacity = [
    currentStep >= 2 ? 1 : 0.3,
    currentStep >= 4 ? 1 : 0.3,
    currentStep >= 6 ? 1 : 0.3,
    currentStep >= 7 ? 1 : 0.3,
  ]
  const petalScale = [
    currentStep >= 2 ? 1 : 0.5,
    currentStep >= 4 ? 1 : 0.5,
    currentStep >= 6 ? 1 : 0.5,
    currentStep >= 7 ? 1 : 0.5,
  ]
  const coreColor = currentStep === 7 ? 'var(--terracotta-dark)' : '#f8bbd0'
  const label = t('steps', 'stepOf').replace('{n}', currentStep)

  return (
    <div className="progress-flower">
      <svg viewBox="0 0 100 100" className="flower-svg">
        <circle cx="50" cy="50" r="10" fill={coreColor} style={{ transition: 'fill 0.5s ease' }} />
        {[
          'M50 40 C 40 10, 60 10, 50 40',
          'M60 50 C 90 40, 90 60, 60 50',
          'M50 60 C 60 90, 40 90, 50 60',
          'M40 50 C 10 60, 10 40, 40 50',
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill={petalColors[i]}
            opacity={petalOpacity[i]}
            style={{
              transformOrigin: '50% 50%',
              transform: `scale(${petalScale[i]})`,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        ))}
      </svg>
      <span className="progress-label">{label}</span>

      <style>{`
        .progress-flower {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .flower-svg {
          width: 72px;
          height: 72px;
          overflow: visible;
        }
        .progress-label {
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--sage-deep);
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  )
}
