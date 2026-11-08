/**
 * Local assets for the prototype.
 * We use static images from the public/images folder to ensure
 * reliable display without AI generation loading screens.
 */
import soilRed from '../assets/soil/red.jpg'
import soilBlack from '../assets/soil/black.jpg'
import soilSandy from '../assets/soil/sandy.jpg'
import soilClay from '../assets/soil/clay.jpg'

const FALLBACK = '/images/fallback.jpg'

export function illustrationUrl(prompt, size = 'landscape_16_9') {
  // AI generation is disabled to prevent loading messages.
  // Returning a stable fallback image instead.
  return FALLBACK
}

export function cropImage(crop, size = 'landscape_4_3') {
  // Use a stable local asset. If we had specific crop images in public/images,
  // we would map them here. For now, we use the fallback to avoid "generating" text.
  return FALLBACK
}

export function diseaseImage(id, size = 'landscape_16_9') {
  return FALLBACK
}

export function alertImage(type, size = 'landscape_16_9') {
  return FALLBACK
}

export const HERO_IMAGE = '/images/hero.jpg'
export const FIELD_IMAGE = '/images/fallback.jpg'
export const LOGIN_IMAGE = '/images/login.jpg'
export const DASHBOARD_BANNER = '/images/dashboard-banner.jpg'

export const PAGE_IMAGES = {
  market: FALLBACK,
  schemes: FALLBACK,
  disease: FALLBACK,
  irrigation: FALLBACK,
  alerts: FALLBACK,
  assistant: FALLBACK,
  summary: FALLBACK,
}

export function pageImage(key, size = 'landscape_16_9') {
  return PAGE_IMAGES[key] || FALLBACK
}

/** Local natural farm scenes for each soil type, bundled with the prototype. */
const SOIL_IMAGES = {
  red: soilRed,
  black: soilBlack,
  sandy: soilSandy,
  clay: soilClay,
}

export function soilImage(id) {
  return SOIL_IMAGES[id] || SOIL_IMAGES.red
}
