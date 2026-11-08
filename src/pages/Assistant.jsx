import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Disclaimer, PageHeader, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ASSISTANT_QUESTIONS } from '../data/sampleData.js'
import { pageImage } from '../lib/images.js'
import { createRecogniser, recognitionSupported, speak, speechSupported, stopSpeaking } from '../lib/speech.js'
import { useGoBack } from '../lib/useGoBack.js'

const GREETING = {
  en: 'Vanakkam! I am your farming friend. Select a question below or speak to me.',
  ta: 'வணக்கம்! நான் உங்கள் விவசாய நண்பன். கீழே ஒரு கேள்வியைத் தேர்ந்தெடுக்கவும் அல்லது என்னிடம் பேசவும்.',
}

export default function Assistant() {
  const { t, L, lang, profile } = useApp()
  const goBack = useGoBack('/dashboard')
  const [messages, setMessages] = useState([{ id: 'greet', from: 'bot', text: GREETING }])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [notice, setNotice] = useState('')
  const [speakingId, setSpeakingId] = useState('')
  const bottomRef = useRef(null)
  const recRef = useRef(null)

  useEffect(() => {
    setMessages([{ id: 'greet', from: 'bot', text: GREETING }])
    setNotice('')
  }, [lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const pushAnswer = (question, answer) => {
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== 'greet'),
      { id: `q-${Date.now()}`, from: 'user', text: question },
      { id: `a-${Date.now()}`, from: 'bot', text: answer },
    ])
  }

  const askSample = (item) => {
    setNotice('')
    pushAnswer(item.q[lang] || item.q.en, item.a[lang] || item.a.en)
  }

  const askTyped = () => {
    const text = input.trim()
    if (!text) return
    const lower = text.toLowerCase()
    const match =
      ASSISTANT_QUESTIONS.find((q) => {
        const keywords = q.q.en.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
        return keywords.some((w) => lower.includes(w))
      }) || null

    if (match) {
      pushAnswer(text, match.a[lang] || match.a.en)
    } else {
      pushAnswer(
        text,
        lang === 'ta'
          ? 'இது ஒரு மாதிரி உதவியாளர். உங்கள் கேள்விக்கான மாதிரி பதில் இல்லை. கீழே உள்ள மாதிரி கேள்விகளில் ஒன்றைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் வேளாண் அலுவலரை அணுகவும்.'
          : 'This is a sample assistant, so I do not have a prepared answer for that question. Please pick one of the sample questions below, or contact your local agricultural officer.',
      )
    }
    setInput('')
  }

  const toggleMic = () => {
    setNotice('')
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    if (!recognitionSupported()) {
      setNotice(t('micUnsupported'))
      return
    }
    const rec = createRecogniser(lang)
    if (!rec) {
      setNotice(t('micUnsupported'))
      return
    }
    recRef.current = rec
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = (event) => {
      setListening(false)
      setNotice(event?.error === 'not-allowed' || event?.error === 'service-not-allowed' ? t('micDenied') : t('micUnsupported'))
    }
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || ''
      setInput(text)
      setListening(false)
      const lower = text.toLowerCase()
      const match = ASSISTANT_QUESTIONS.find((q) =>
        q.q.en.toLowerCase().split(/\s+/).filter((w) => w.length > 4).some((w) => lower.includes(w)),
      )
      if (match) pushAnswer(text, match.a[lang] || match.a.en)
    }
    try {
      rec.start()
    } catch {
      setNotice(t('micUnsupported'))
    }
  }

  const speakAnswer = async (message) => {
    setSpeakingId(message.id)
    const result = await speak(message.text, lang)
    setSpeakingId('')
    if (!result.ok) setNotice(result.reason === 'no-voice' ? t('tamilSpeechUnavailable') : t('voiceUnsupported'))
  }

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('assistantName')}
        subtitle={t('assistantSub')}
        onBack={goBack}
        image={pageImage('assistant')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Sparkles" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Assistant illustration + mic */}
        <div className="card overflow-hidden p-0">
          <div className="leaf-pattern flex flex-col items-center gap-4 bg-gradient-to-br from-sprout/70 to-cream px-4 py-6">
            <div className="flex items-center gap-3">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-forest shadow-soft">
                <Icon name="Sprout" size={32} />
              </span>
              <div>
                <p className="font-bold text-forest">{t('assistantName')}</p>
                <p className="text-xs text-earth">
                  {profile.soil ? `${t('sectionSoil')}: ${t(`soil${profile.soil[0].toUpperCase()}${profile.soil.slice(1)}`)}` : t('assistantSub')}
                </p>
              </div>
            </div>

            <div className="relative">
              {listening ? (
                <span className="absolute inset-0 rounded-full bg-urgent/40 animate-pulseRing" aria-hidden="true" />
              ) : null}
              <button
                type="button"
                onClick={toggleMic}
                aria-pressed={listening}
                aria-label={t('tapToSpeak')}
                className={`relative grid h-24 w-24 place-items-center rounded-full text-white shadow-soft transition ${
                  listening ? 'bg-urgent' : 'bg-forest hover:bg-leaf'
                }`}
              >
                <Icon name={listening ? 'MicOff' : 'Mic'} size={40} />
              </button>
            </div>
            <p className="text-sm font-semibold text-forest">{listening ? t('listening') : t('tapToSpeak')}</p>
          </div>

          {/* Conversation */}
          <div className="max-h-[46vh] space-y-3 overflow-y-auto border-t border-sprout bg-white p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${
                    m.from === 'user' ? 'bg-forest text-white' : 'border-2 border-sprout bg-cream text-forest'
                  }`}
                >
                  <p>{m.text[lang] || m.text.en || m.text}</p>
                  {m.from === 'bot' && m.id !== 'greet' ? (
                    <button
                      type="button"
                      onClick={() => speakAnswer(m)}
                      className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-forest"
                    >
                      <Icon name={speakingId === m.id ? 'Loader' : 'Volume2'} size={14} />
                      {t('speakAnswer')}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-sprout p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') askTyped()
                }}
                placeholder={t('typeQuestion')}
                className="field flex-1"
                aria-label={t('typeQuestion')}
              />
              <button type="button" onClick={askTyped} className="btn-primary shrink-0 px-4" aria-label={t('send')}>
                <Icon name="Send" size={20} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {speechSupported() ? (
                <button type="button" className="chip min-h-[40px] bg-cream px-3 text-earth" onClick={() => stopSpeaking()}>
                  <Icon name="VolumeX" size={15} />
                  {t('stop')}
                </button>
              ) : null}
              <button
                type="button"
                className="chip min-h-[40px] bg-cream px-3 text-earth"
                onClick={() => setMessages([{ id: 'greet', from: 'bot', text: GREETING }])}
              >
                <Icon name="RotateCcw" size={15} />
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>

        {notice ? (
          <Disclaimer icon="TriangleAlert" tone="caution">
            {notice}
          </Disclaimer>
        ) : null}

        {/* Sample questions */}
        <div className="card p-4">
          <Section icon="MessageCircleQuestion" title={t('sampleQuestions')} subtitle={t('talkAbout')} />
          <div className="grid gap-2 sm:grid-cols-2">
            {ASSISTANT_QUESTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => askSample(item)}
                className="flex min-h-[52px] items-center gap-2.5 rounded-2xl border-2 border-sprout bg-cream px-3.5 py-3 text-left text-sm font-medium text-forest transition hover:border-leaf hover:bg-sprout/40"
              >
                <Icon name="MessageCircle" size={16} className="shrink-0 text-leaf" />
                <span className="min-w-0">{item.q[lang] || item.q.en}</span>
              </button>
            ))}
          </div>
        </div>

        <Disclaimer icon="Info">{t('assistantDisclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
