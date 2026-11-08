import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translate } from '../i18n/strings.js'

const STORAGE_KEY = 'dfs-prototype-state-v1'

const EMPTY_PROFILE = {
  district: '',
  village: '',
  landSize: 2,
  soil: '',
  waterSources: [],
  previousCrop: '',
  locationLabel: '',
}

const DEFAULT_STATE = {
  lang: 'en',
  isGuest: false,
  mobile: '',
  profile: EMPTY_PROFILE,
  selectedCropId: '',
  compareIds: [],
  completedStages: [],
  readAlerts: [],
  reminders: [],
  alertsEnabled: true,
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: { ...EMPTY_PROFILE, ...(parsed.profile || {}) },
    }
  } catch {
    return DEFAULT_STATE
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable in private mode — the prototype still works */
    }
  }, [state])

  useEffect(() => {
    document.documentElement.lang = state.lang === 'ta' ? 'ta' : 'en'
  }, [state.lang])

  const value = useMemo(() => {
    const patch = (partial) => setState((prev) => ({ ...prev, ...partial }))
    const t = (key) => translate(key, state.lang)
    const L = (obj) => (obj ? obj[state.lang] || obj.en : '')

    return {
      ...state,
      t,
      L,
      setLang: (lang) => patch({ lang }),
      setProfile: (profile) => patch({ profile: { ...EMPTY_PROFILE, ...profile } }),
      patchProfile: (partial) => setState((prev) => ({ ...prev, profile: { ...prev.profile, ...partial } })),
      resetProfile: () => patch({ profile: EMPTY_PROFILE }),
      setLogin: ({ isGuest, mobile }) => patch({ isGuest, mobile }),
      setSelectedCrop: (selectedCropId) => patch({ selectedCropId }),
      toggleCompare: (id) =>
        setState((prev) => {
          const has = prev.compareIds.includes(id)
          if (has) return { ...prev, compareIds: prev.compareIds.filter((c) => c !== id) }
          if (prev.compareIds.length >= 3) return prev
          return { ...prev, compareIds: [...prev.compareIds, id] }
        }),
      setCompare: (compareIds) => patch({ compareIds }),
      toggleStage: (id) =>
        setState((prev) => ({
          ...prev,
          completedStages: prev.completedStages.includes(id)
            ? prev.completedStages.filter((s) => s !== id)
            : [...prev.completedStages, id],
        })),
      toggleAlertRead: (id) =>
        setState((prev) => ({
          ...prev,
          readAlerts: prev.readAlerts.includes(id)
            ? prev.readAlerts.filter((a) => a !== id)
            : [...prev.readAlerts, id],
        })),
      markAllAlertsRead: (ids) => patch({ readAlerts: ids }),
      addReminder: (reminder) =>
        setState((prev) =>
          prev.reminders.some((r) => r.id === reminder.id)
            ? prev
            : { ...prev, reminders: [...prev.reminders, reminder] },
        ),
      removeReminder: (id) =>
        setState((prev) => ({ ...prev, reminders: prev.reminders.filter((r) => r.id !== id) })),
      setAlertsEnabled: (alertsEnabled) => patch({ alertsEnabled }),
      hasProfile: Boolean(state.profile.district && state.profile.soil),
    }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export { EMPTY_PROFILE }
