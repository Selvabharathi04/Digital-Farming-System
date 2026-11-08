import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icons.jsx'
import { Logo } from './Logo.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ALERTS } from '../data/sampleData.js'

const NAV = [
  { to: '/dashboard', key: 'navHome', icon: 'Home' },
  { to: '/alerts', key: 'navAlerts', icon: 'Bell' },
  { to: '/farm-profile', key: 'navProfile', icon: 'UserRound' },
  { to: '/summary', key: 'navHelp', icon: 'LifeBuoy' },
]

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useApp()
  return (
    <div
      className={`flex items-center rounded-full border-2 border-sprout bg-white p-1 ${compact ? '' : 'shadow-card'}`}
      role="group"
      aria-label="Language"
    >
      {[
        { id: 'ta', label: 'தமிழ்' },
        { id: 'en', label: 'EN' },
      ].map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setLang(opt.id)}
          aria-pressed={lang === opt.id}
          className={`min-h-[36px] rounded-full px-3 text-sm font-semibold transition ${
            lang === opt.id ? 'bg-forest text-white' : 'text-forest hover:bg-sprout/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function Layout() {
  const { t, pathnameKey } = useNavHelpers()
  const { readAlerts } = useApp()
  const online = useOnlineStatus()
  const unread = ALERTS.filter((a) => !readAlerts.includes(a.id)).length

  return (
    <div className="min-h-screen pb-24 lg:pb-0" key={pathnameKey}>
      {/* Desktop top bar */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <div className="card flex items-center justify-between gap-6 px-5 py-3">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div>
                <p className="text-base font-bold leading-tight text-forest">{t('appName')}</p>
                <p className="text-xs text-earth">{t('tagline')}</p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                      isActive ? 'bg-forest text-white' : 'text-forest hover:bg-sprout/50'
                    }`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  {t(item.key)}
                  {item.to === '/alerts' && unread > 0 ? (
                    <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-urgent px-1 text-[11px] font-bold text-white">
                      {unread}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <OfflinePill online={online} t={t} />
              <LanguageToggle compact />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-0 pb-6 sm:px-4 lg:px-6 lg:pt-6">
        <Outlet />
      </main>

      {/* Mobile fixed bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sprout bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition ${
                  isActive ? 'text-forest' : 'text-earth/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`relative grid h-9 w-14 place-items-center rounded-full transition ${isActive ? 'bg-sprout' : ''}`}>
                    <Icon name={item.icon} size={20} />
                    {item.to === '/alerts' && unread > 0 ? (
                      <span className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-urgent px-1 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    ) : null}
                  </span>
                  {t(item.key)}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="fixed right-3 top-3 z-30 lg:hidden">
        <LanguageToggle />
      </div>
    </div>
  )
}

function OfflinePill({ online, t }) {
  return (
    <span
      className={`chip ${
        online ? 'bg-sprout/60 text-forest' : 'bg-urgent/12 text-urgent'
      }`}
      title={online ? t('offlineOn') : t('offlineNotice')}
    >
      <Icon name={online ? 'Wifi' : 'WifiOff'} size={14} />
      {online ? t('offlineOn') : t('offlineMode')}
    </span>
  )
}

function useNavHelpers() {
  const { t } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  return { t, navigate, pathnameKey: location.pathname }
}

export { LanguageToggle }
