import { CROPS } from '../data/sampleData.js'

/** How much water each source can realistically provide (illustrative scale). */
const WATER_CAPACITY = { canal: 88, borewell: 68, well: 62, rainfed: 34 }

const DEMAND_SCORE = { high: 92, medium: 74, low: 55 }

/** Sample market/weather risk factor per crop (illustrative only). */
const WEATHER_SCORE = {
  paddy: 78,
  maize: 86,
  groundnut: 88,
  cotton: 66,
  millets: 92,
  sugarcane: 70,
  pulses: 84,
  banana: 62,
}

export function waterCapacity(sources = []) {
  if (!sources.length) return 30
  const best = Math.max(...sources.map((s) => WATER_CAPACITY[s] ?? 40))
  // A second independent source slightly improves reliability.
  const bonus = sources.length > 1 ? 6 : 0
  return Math.min(95, best + bonus)
}

export function scoreCrop(crop, profile) {
  const soilScore = crop.bestSoils.includes(profile.soil)
    ? 100
    : crop.okSoils.includes(profile.soil)
      ? 72
      : 34

  const capacity = waterCapacity(profile.waterSources)
  const gap = crop.waterLevel - capacity
  const waterScore = gap <= 0 ? 100 : Math.max(20, 100 - gap * 1.6)

  const landScore = profile.landSize >= 2 ? 92 : profile.landSize >= 1 ? 80 : 68

  const marketScore = DEMAND_SCORE[crop.demand] ?? 70
  const weatherScore = WEATHER_SCORE[crop.id] ?? 80

  const match = Math.round(
    soilScore * 0.3 + waterScore * 0.28 + weatherScore * 0.18 + marketScore * 0.14 + landScore * 0.1,
  )

  const level = match >= 75 ? 'good' : match >= 58 ? 'caution' : 'risk'

  const aspects = {
    soil: soilScore,
    water: waterScore,
    weather: weatherScore,
    market: marketScore,
  }

  return {
    crop,
    match,
    level,
    aspects,
    waterGap: gap,
    availableWater: capacity,
    reason: buildReason(aspects),
  }
}

/** Build a bilingual reason sentence from the aspect scores. */
function buildReason({ soil, water, weather, market }) {
  const soilGood = soil >= 90
  const soilOk = soil >= 60
  const waterGood = water >= 85
  const waterOk = water >= 60

  if (soilGood && !waterOk) {
    return {
      en: 'Suitable for your soil, but water availability may be insufficient for this crop.',
      ta: 'உங்கள் மண்ணுக்கு ஏற்றது, ஆனால் இந்த பயிருக்கு நீர் வசதி போதுமானதாக இல்லாமல் இருக்கலாம்.',
    }
  }
  if (soilGood && waterGood && weather >= 80) {
    return {
      en: 'Well matched to your soil, water availability and the current weather outlook.',
      ta: 'உங்கள் மண், நீர் வசதி மற்றும் தற்போதைய வானிலை நிலைக்கு நன்கு பொருந்துகிறது.',
    }
  }
  if (soilGood && waterGood && weather < 80) {
    return {
      en: 'Soil and water suit this crop well, but the current weather pattern needs watching.',
      ta: 'மண் மற்றும் நீர் இந்த பயிருக்கு நன்றாக பொருந்துகிறது, ஆனால் தற்போதைய வானிலை நிலையை கவனிக்க வேண்டும்.',
    }
  }
  if (!soilOk) {
    return {
      en: 'This crop is not well suited to your soil type. Consider it only with expert advice.',
      ta: 'இந்த பயிர் உங்கள் மண் வகைக்கு நன்கு பொருந்தவில்லை. நிபுணர் ஆலோசனையுடன் மட்டுமே பரிசீலிக்கவும்.',
    }
  }
  if (market < 75) {
    return {
      en: 'Agronomically possible, but market demand is currently moderate. Check prices before sowing.',
      ta: 'விவசாய ரீதியாக சாத்தியம், ஆனால் சந்தை தேவை தற்போது மிதமானது. விதைப்பதற்கு முன் விலையைப் பாருங்கள்.',
    }
  }
  return {
    en: 'Partially suitable for your farm. Review water and market factors before deciding.',
    ta: 'உங்கள் பண்ணைக்கு ஓரளவு ஏற்றது. முடிவெடுக்கும் முன் நீர் மற்றும் சந்தை காரணிகளைப் பாருங்கள்.',
  }
}

/** Top recommendations for a profile, best first. Shows a realistic mix of levels. */
export function recommendCrops(profile, limit = 3) {
  if (!profile?.soil) return []
  const scored = CROPS.map((c) => scoreCrop(c, profile)).sort((a, b) => b.match - a.match)

  // Keep the top pick, then prefer a mix so results are not all "green".
  const top = scored[0]
  const rest = scored.slice(1)
  const strong = rest.find((s) => s.level === 'good')
  const caution = rest.find((s) => s.level === 'caution')
  const risk = rest.find((s) => s.level === 'risk')

  const picks = [top]
  if (strong && picks.length < limit) picks.push(strong)
  if (caution) picks.push(caution)
  else if (strong && !picks.includes(strong)) picks.push(strong)
  if (risk && picks.length < limit) picks.push(risk)

  return picks.slice(0, limit)
}

export function getCropById(id) {
  return CROPS.find((c) => c.id === id) || null
}

export function levelStyles(level) {
  if (level === 'good') {
    return { bg: 'bg-calm/10', border: 'border-calm', text: 'text-calm', dot: 'bg-calm', key: 'goodMatch' }
  }
  if (level === 'caution') {
    return { bg: 'bg-caution/15', border: 'border-caution', text: 'text-[#8a5b00]', dot: 'bg-caution', key: 'needsCaution' }
  }
  return { bg: 'bg-urgent/10', border: 'border-urgent', text: 'text-urgent', dot: 'bg-urgent', key: 'highRisk' }
}

/** Format a number as Indian Rupees. */
export function inr(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`
}

/** Score → simple bilingual word. */
export function scoreWord(score) {
  if (score >= 85) return { en: 'High', ta: 'அதிகம்' }
  if (score >= 60) return { en: 'Medium', ta: 'நடுத்தரம்' }
  return { en: 'Low', ta: 'குறைவு' }
}
