import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Logo } from '../components/Logo.jsx'
import { Disclaimer } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { HERO_IMAGE } from '../lib/images.js'
import { speak, speechSupported, stopSpeaking } from '../lib/speech.js'

const LANGS = [
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
  { id: 'en', label: 'English', sub: 'ஆங்கிலம்' },
]

export default function Welcome() {
  const { t, lang, setLang } = useApp()
  const navigate = useNavigate()
  const [showVoice, setShowVoice] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-12">
        {/* Hero */}
        <section className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[28px] border-2 border-sprout bg-white shadow-soft">
            <img
              src={HERO_IMAGE}
              alt={t('welcomeTitle')}
              className="h-56 w-full object-cover sm:h-72 lg:h-96"
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent px-4 pb-4 pt-10 text-white">
              <p className="text-sm font-medium">{t('tagline')}</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <Logo size={54} />
            <div>
              <h1 className="text-xl font-bold leading-tight text-forest sm:text-2xl">{t('appName')}</h1>
              <p className="text-xs text-earth sm:text-sm">{t('tagline')}</p>
            </div>
          </div>

          <h2 className="mt-6 text-3xl font-bold leading-tight text-amber-700 sm:text-4xl">{t('welcomeTitle')}</h2>
          <p className="mt-3 text-base leading-relaxed text-earth">{t('welcomeMsg')}</p>

          <div className="mt-6">
            <p className="label">{t('chooseLanguage')}</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGS.map((opt) => {
                const active = lang === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLang(opt.id)}
                    aria-pressed={active}
                    className={`relative rounded-xl2 border-2 bg-white p-4 text-left transition ${
                      active ? 'border-forest shadow-soft' : 'border-sprout hover:border-leaf/60'
                    }`}
                  >
                    <span className="block text-2xl font-bold leading-tight text-forest">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-earth">{opt.sub}</span>
                    {active ? (
                      <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-forest text-white">
                        <Icon name="Check" size={16} />
                      </span>
                    ) : null}
                    {active ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-calm">
                        <Icon name="CircleCheck" size={14} />
                        {t('selected')}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn-primary flex-1" onClick={() => navigate('/login')}>
              <Icon name="ArrowRight" size={20} />
              {t('start')}
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowVoice(true)}>
              <Icon name="Mic" size={20} />
              {t('voiceAssistance')}
            </button>
          </div>

          <p className="mt-4 text-xs text-earth">
            {t('demoData')} · {t('appName')} — frontend prototype
          </p>
        </section>
      </div>

      {showVoice ? <VoiceDemo onClose={() => setShowVoice(false)} /> : null}
    </div>
  )
}

const DEMO_LINES = [
  { en: 'Vanakkam! I am your farming friend. Ask me about crops, water or weather.', ta: 'வணக்கம்! நான் உங்கள் விவசாய நண்பன். பயிர், நீர் அல்லது வானிலை பற்றி கேளுங்கள்.' },
  { en: 'Your soil is red soil. Groundnut and maize suit your farm well.', ta: 'உங்கள் மண் செம்மண். நிலக்கடலை மற்றும் மக்காச்சோளம் உங்கள் பண்ணைக்கு நன்றாக பொருந்தும்.' },
  { en: 'Rain is likely this evening. You can delay watering by one day.', ta: 'இன்று மாலை மழை வாய்ப்பு உள்ளது. ஒரு நாள் நீர்ப்பாசனத்தை தாமதிக்கலாம்.' },
]

function VoiceDemo({ onClose }) {
  const { t, lang } = useApp()
  const [status, setStatus] = useState('')
  const [activeIndex, setActiveIndex] = useState(null)

  const handleSpeak = async (line, index) => {
    setActiveIndex(index)
    const result = await speak(line[lang] || line.en, lang)
    if (!result.ok) setStatus(result.reason === 'no-voice' ? t('tamilSpeechUnavailable') : t('voiceUnsupported'))
    else setStatus('')
    setActiveIndex(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest/50 p-3 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[26px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sprout text-forest">
              <Icon name="Volume2" size={22} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-forest">{t('voiceDemoTitle')}</h3>
              <p className="text-xs text-earth">{t('voiceDemoNote')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('close')} className="grid h-10 w-10 place-items-center rounded-full bg-cream text-forest">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {DEMO_LINES.map((line, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSpeak(line, i)}
              className="flex w-full items-start gap-3 rounded-2xl border-2 border-sprout bg-cream p-3 text-left transition hover:border-leaf"
            >
              <Icon name={activeIndex === i ? 'Loader' : 'Play'} size={18} className="mt-0.5 text-leaf" />
              <span className="text-sm leading-relaxed text-forest">{line[lang] || line.en}</span>
            </button>
          ))}
        </div>

        {status ? (
          <div className="mt-3">
            <Disclaimer icon="TriangleAlert" tone="caution">
              {status}
            </Disclaimer>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          {speechSupported() ? (
            <button type="button" className="btn-secondary flex-1" onClick={() => stopSpeaking()}>
              <Icon name="Square" size={18} />
              {t('stop')}
            </button>
          ) : null}
          <button type="button" className="btn-primary flex-1" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
