import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, ProgressBar, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DISTRICTS, FORECAST, SOIL_TYPES, WATER_SOURCES, WEATHER, ALERTS } from '../data/sampleData.js'
import { DASHBOARD_BANNER } from '../lib/images.js'

const FEATURE_CARDS = [
  { to: '/recommend', icon: 'Wheat', emoji: '🌾', titleKey: 'featCropSuggestion', descKey: 'featCropSuggestionDesc', tone: 'from-forest to-leaf' },
  { to: '/alerts', icon: 'CloudRain', emoji: '🌧️', titleKey: 'featWeatherAlerts', descKey: 'featWeatherAlertsDesc', tone: 'from-[#1565C0] to-[#42A5F5]' },
  { to: '/irrigation', icon: 'Droplets', emoji: '💧', titleKey: 'featIrrigation', descKey: 'featIrrigationDesc', tone: 'from-[#0277BD] to-[#4FC3F7]' },
  { to: '/disease', icon: 'Bug', emoji: '🐛', titleKey: 'featDisease', descKey: 'featDiseaseDesc', tone: 'from-[#6A1B9A] to-[#AB47BC]' },
  { to: '/market', icon: 'BadgeIndianRupee', emoji: '💰', titleKey: 'featMarket', descKey: 'featMarketDesc', tone: 'from-[#EF6C00] to-sun' },
  { to: '/assistant', icon: 'Mic', emoji: '🎤', titleKey: 'featAskTamil', descKey: 'featAskTamilDesc', tone: 'from-earth to-[#A1887F]' },
]

const SMALL_CARDS = [
  { to: '/plan', icon: 'CalendarDays', titleKey: 'toCropCalendar' },
  { to: '/plan', icon: 'RefreshCw', titleKey: 'toCropRotation' },
  { to: '/disease', icon: 'FlaskConical', titleKey: 'toPestGuide' },
  { to: '/schemes', icon: 'Landmark', titleKey: 'toSchemes' },
  { to: '/harvesting', icon: 'Wheat', titleKey: 'toHarvesting' },
]

export default function Dashboard() {
  const { t, L, lang, profile, hasProfile, selectedCropId, readAlerts } = useApp()
  const navigate = useNavigate()
  const [showForecast, setShowForecast] = useState(false)

  const district = DISTRICTS.find((d) => d.id === profile.district)
  const soil = SOIL_TYPES.find((s) => s.id === profile.soil)
  const water = WATER_SOURCES.filter((w) => profile.waterSources.includes(w.id))
  const unread = ALERTS.filter((a) => !readAlerts.includes(a.id)).length

  const today = new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="animate-floatUp">
      {/* Green welcome header */}
      <header className="leaf-pattern rounded-b-[28px] bg-gradient-to-br from-forest to-leaf px-4 pb-6 pt-5 text-white shadow-soft sm:rounded-3xl sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight text-sun sm:text-3xl">
                {t('vanakkam')} <span aria-hidden="true">🌱</span>
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                <Icon name="MapPin" size={15} />
                {hasProfile
                  ? profile.locationLabel || L(district)
                  : lang === 'ta'
                    ? 'இடம் தேர்ந்தெடுக்கப்படவில்லை'
                    : 'Location not selected yet'}
              </p>
            </div>
            <Link
              to="/farm-profile"
              className="chip min-h-[44px] shrink-0 bg-white/20 px-4 text-white transition hover:bg-white/30"
            >
              <Icon name={hasProfile ? 'PenLine' : 'Plus'} size={15} />
              {hasProfile ? t('changeFarmDetails') : t('farmProfileTitle')}
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="plain">
              <Icon name="CalendarDays" size={14} />
              {today}
            </Badge>
            {soil ? (
              <Badge tone="plain">
                <Icon name="Layers" size={14} />
                {t(soil.key)}
              </Badge>
            ) : null}
            {water.map((w) => (
              <Badge key={w.id} tone="plain">
                <Icon name={w.icon} size={14} />
                {t(w.key)}
              </Badge>
            ))}
            {profile.landSize ? (
              <Badge tone="plain">
                <Icon name="Ruler" size={14} />
                {profile.landSize} {t('acres')}
              </Badge>
            ) : null}
          </div>

          <img
            src={DASHBOARD_BANNER}
            alt={t('appName')}
            loading="lazy"
            className="mt-4 h-32 w-full rounded-2xl object-cover sm:h-44"
          />
        </div>
      </header>

      <div className="space-y-6 px-4 pt-5 sm:px-6">
        {/* Weather card */}
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-[#E3F2FD] to-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                  <Icon name="CloudSun" size={18} className="text-[#1565C0]" />
                  {t('weatherToday')}
                </p>
                <p className="mt-0.5 text-xs text-earth">
                  {hasProfile ? profile.locationLabel || L(district) : '—'} · {today}
                </p>
              </div>
              <Badge tone="caution" icon="FlaskConical">
                {t('sampleWeather')}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3">
                <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white shadow-card">
                  <Icon name={WEATHER.icon} size={34} className="text-[#1565C0]" />
                </span>
                <div>
                  <p className="text-4xl font-bold leading-none text-forest">{WEATHER.temp}°C</p>
                  <p className="mt-1 text-sm text-earth">{L(WEATHER.condition)}</p>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                <MiniStat icon="CloudRain" label={t('rainChance')} value={`${WEATHER.rainChance}%`} />
                <MiniStat icon="Droplet" label={lang === 'ta' ? 'ஈரப்பதம்' : 'Humidity'} value={`${WEATHER.humidity}%`} />
                <MiniStat icon="Wind" label={lang === 'ta' ? 'காற்று' : 'Wind'} value={`${WEATHER.windKph} km/h`} />
                <MiniStat icon="Thermometer" label={lang === 'ta' ? 'உணர்வு' : 'Feels like'} value={`${WEATHER.feelsLike}°C`} />
              </div>
            </div>

            <button type="button" className="btn-secondary mt-4 w-full sm:w-auto" onClick={() => setShowForecast((v) => !v)}>
              <Icon name="CalendarRange" size={18} />
              {t('viewForecast')}
              <Icon name={showForecast ? 'ChevronUp' : 'ChevronDown'} size={18} />
            </button>
          </div>

          {showForecast ? (
            <div className="border-t border-sprout p-4 sm:p-5">
              <p className="mb-3 text-sm font-semibold text-forest">{t('forecast7')}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {FORECAST.map((day) => (
                  <div key={day.en} className="w-[92px] shrink-0 rounded-2xl border border-sprout bg-cream p-3 text-center">
                    <p className="text-xs font-semibold text-earth">{L(day.day)}</p>
                    <Icon name={day.icon} size={26} className="mx-auto my-1.5 text-[#1565C0]" />
                    <p className="text-sm font-bold text-forest">{day.hi}°</p>
                    <p className="text-xs text-earth">{day.lo}°</p>
                    <p className="mt-1 flex items-center justify-center gap-0.5 text-[11px] text-[#1565C0]">
                      <Icon name="Droplet" size={11} />
                      {day.rain}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        {/* Alert summary */}
        {unread > 0 ? (
          <Link to="/alerts" className="flex items-center gap-3 rounded-2xl border-2 border-caution/40 bg-caution/10 p-4 transition hover:bg-caution/15">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#8a5b00]">
              <Icon name="BellRing" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[#8a5b00]">
                {unread} {t('unreadAlerts')}
              </span>
              <span className="block truncate text-sm text-earth">{t('demoAlertsNote')}</span>
            </span>
            <Icon name="ChevronRight" size={20} className="text-[#8a5b00]" />
          </Link>
        ) : null}

        {/* Main feature grid */}
        <section>
          <Section icon="LayoutGrid" title={t('mainFeatures')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((f) => (
              <Link
                key={f.to + f.titleKey}
                to={f.to}
                className={`group relative overflow-hidden rounded-xl2 bg-gradient-to-br ${f.tone} p-4 text-white shadow-soft transition hover:-translate-y-0.5`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20">
                  <Icon name={f.icon} size={26} />
                </span>
                <p className="mt-3 text-base font-bold leading-tight">
                  <span className="mr-1" aria-hidden="true">{f.emoji}</span>
                  {t(f.titleKey)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/90">{t(f.descKey)}</p>
                <Icon name="ArrowRight" size={18} className="absolute right-3.5 top-4 opacity-70 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* Crop plan shortcut */}
        {selectedCropId ? (
          <Link to="/plan" className="flex items-center gap-3 rounded-2xl border-2 border-leaf/30 bg-sprout/30 p-4 transition hover:bg-sprout/50">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-forest">
              <Icon name="CalendarCheck" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-forest">{t('yourFarmingPlan')}</span>
              <span className="block text-sm text-earth">{t('planSub')}</span>
            </span>
            <Icon name="ChevronRight" size={20} className="text-forest" />
          </Link>
        ) : null}

        {/* Smaller cards */}
        <section>
          <Section icon="Sprout" title={t('moreTools')} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SMALL_CARDS.map((c) => (
              <Link
                key={c.titleKey}
                to={c.to}
                className="card flex items-center gap-3 p-4 transition hover:border-leaf/60 hover:shadow-soft"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sprout/60 text-forest">
                  <Icon name={c.icon} size={20} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-forest">{t(c.titleKey)}</span>
                <Icon name="ChevronRight" size={18} className="text-leaf" />
              </Link>
            ))}
          </div>
        </section>

        {/* Offline readiness */}
        <Card>
          <Section icon="WifiOff" title={t('offlineMode')} subtitle={t('offlineNotice')} />
          <div className="space-y-3">
            <ProgressBar value={92} tone="leaf" label={t('offlineOn')} />
            <p className="text-sm text-earth">{t('offlineOn')}</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="calm" icon="Check">App shell</Badge>
              <Badge tone="calm" icon="Check">Sample crop data</Badge>
              <Badge tone="calm" icon="Check">Saved farm profile</Badge>
              <Badge tone="earth" icon="Minus">Live weather (demo)</Badge>
            </div>
          </div>
        </Card>

        <Disclaimer icon="Info">
          {lang === 'ta'
            ? 'இந்த செயலி ஒரு முன்னணி மாதிரி. அனைத்து வானிலை, சந்தை மற்றும் நோய் தகவல்களும் மாதிரி தரவு.'
            : 'This is a frontend prototype. All weather, market and disease information shown is sample data.'}
        </Disclaimer>

        <button type="button" className="btn-primary w-full sm:hidden" onClick={() => navigate('/recommend')}>
          <Icon name="Wheat" size={19} />
          {t('featCropSuggestion')}
        </button>
      </div>
    </div>
  )
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/80 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-leaf">
        <Icon name={icon} size={13} />
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-forest">{value}</p>
    </div>
  )
}
