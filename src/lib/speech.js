/** Small helpers around the browser Speech Synthesis / Recognition APIs. */

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function recognitionSupported() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function langCode(lang) {
  return lang === 'ta' ? 'ta-IN' : 'en-IN'
}

/** Returns true when the browser has a voice for the requested language. */
export function hasVoiceFor(lang) {
  if (!speechSupported()) return false
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return false
  const prefix = lang === 'ta' ? 'ta' : 'en'
  return voices.some((v) => v.lang && v.lang.toLowerCase().startsWith(prefix))
}

/**
 * Speak text out loud. Resolves with { ok, reason }.
 * `reason` is 'unsupported' or 'no-voice' when nothing was spoken.
 */
export function speak(text, lang) {
  return new Promise((resolve) => {
    if (!speechSupported()) {
      resolve({ ok: false, reason: 'unsupported' })
      return
    }
    const synth = window.speechSynthesis
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = langCode(lang)
    utter.rate = 0.95
    const voices = synth.getVoices()
    const match =
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(lang === 'ta' ? 'ta' : 'en')) || null
    if (match) utter.voice = match
    if (lang === 'ta' && !match) {
      resolve({ ok: false, reason: 'no-voice' })
      return
    }
    utter.onend = () => resolve({ ok: true })
    utter.onerror = () => resolve({ ok: false, reason: 'error' })
    synth.speak(utter)
  })
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel()
}

/** Create a recogniser instance. Returns null when unsupported. */
export function createRecogniser(lang) {
  if (!recognitionSupported()) return null
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
  const rec = new Ctor()
  rec.lang = langCode(lang)
  rec.interimResults = false
  rec.maxAlternatives = 1
  rec.continuous = false
  return rec
}

/** Copy text to the clipboard with a legacy fallback. */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
