import { useMemo, useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, PageHeader, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DISTRICTS, ALERTS } from '../data/sampleData.js'
import { pageImage, alertImage } from '../lib/images.js'
import { speak, stopSpeaking } from '../lib/speech.js'
import { useGoBack } from '../lib/useGoBack.js'

const LEVELS = {
  high: { key: 'urgent', label: 'urgent', tone: 'urgent', ring: 'border-urgent bg-urgent/8', chip: 'bg-urgent text-white', icon: 'OctagonAlert' },
  medium: { key: 'cautionLevel', label: 'caution', tone: 'caution', ring: 'border-caution bg-caution/10', chip: 'bg-caution text-[#4d3200]', icon: 'TriangleAlert' },
  low: { key: 'normal', label: 'normal', tone: 'calm', ring: 'border-calm bg-calm/6', chip: 'bg-calm text-white', icon: 'CircleCheck' },
}

const TYPE_KEYS = {
  weather: 'weatherAlerts',
  disease: 'diseaseAlerts',
  irrigation: 'irrigationAlerts',
}

export default function Alerts() {
  const { t, L, lang, readAlerts, toggleAlertRead, markAllAlertsRead } = useApp()
  const goBack = useGoBack('/dashboard')
  const [speakingId, setSpeakingId] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('all')

  const grouped = useMemo(() => {
    const list = filter === 'all' ? ALERTS : ALERTS.filter((a) => a.type === filter)
    return {
      weather: list.filter((a) => a.type === 'weather'),
      disease: list.filter((a) => a.type === 'disease'),
      irrigation: list.filter((a) => a.type === 'irrigation'),
    }
  }, [filter])

  const unread = ALERTS.filter((a) => !readAlerts.includes(a.id))

  const readAloud = async (alert) => {
    const parts = [
      L(alert.title),
      L(alert.body),
      alert.symptoms ? `${t('symptomsToCheck')}: ${L(alert.symptoms)}` : '',
      `${t('recommendedAction')}: ${L(alert.action)}`,
    ].filter(Boolean)
    setSpeakingId(alert.id)
    const result = await speak(parts.join('. '), lang)
    setSpeakingId('')
    if (!result.ok) setNotice(result.reason === 'no-voice' ? t('tamilSpeechUnavailable') : t('voiceUnsupported'))
    else setNotice('')
  }

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('farmAlerts')}
        subtitle={t('alertsSub')}
        onBack={goBack}
        image={pageImage('alerts')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="BellRing" size={14} />
            {unread.length} {t('unreadAlerts')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: t('farmAlerts'), icon: 'LayoutGrid' },
            { id: 'weather', label: t('weatherAlerts'), icon: 'CloudRain' },
            { id: 'disease', label: t('diseaseAlerts'), icon: 'Bug' },
            { id: 'irrigation', label: t('irrigationAlerts'), icon: 'Droplets' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`chip min-h-[42px] border-2 px-3.5 transition ${
                filter === f.id ? 'border-forest bg-forest text-white' : 'border-sprout bg-white text-forest hover:bg-sprout/40'
              }`}
            >
              <Icon name={f.icon} size={15} />
              {f.label}
            </button>
          ))}
          {unread.length ? (
            <button
              type="button"
              className="chip min-h-[42px] bg-cream px-3.5 text-earth"
              onClick={() => markAllAlertsRead(ALERTS.map((a) => a.id))}
            >
              <Icon name="CheckCheck" size={15} />
              {t('markAsRead')} ({unread.length})
            </button>
          ) : null}
        </div>

        {notice ? (
          <Disclaimer icon="TriangleAlert" tone="caution">
            {notice}
          </Disclaimer>
        ) : null}

        {/* Legend */}
        <Card className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-earth">{t('farmAlerts')}:</span>
          {Object.values(LEVELS).map((lvl) => (
            <span key={lvl.key} className={`chip ${lvl.chip}`}>
              <Icon name={lvl.icon} size={13} />
              {t(lvl.key)}
            </span>
          ))}
        </Card>

        {['weather', 'disease', 'irrigation'].map((type) => {
          const list = grouped[type]
          if (!list.length) return null
          const icons = { weather: 'CloudRain', disease: 'Bug', irrigation: 'Droplets' }
          return (
            <section key={type}>
              <Section icon={icons[type]} title={t(TYPE_KEYS[type])} subtitle={`${list.length}`} />
              <div className="space-y-3">
                {list.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    t={t}
                    L={L}
                    isRead={readAlerts.includes(alert.id)}
                    isSpeaking={speakingId === alert.id}
                    onRead={() => readAloud(alert)}
                    onToggleRead={() => toggleAlertRead(alert.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}

        <div className="flex gap-2">
          <button type="button" className="btn-secondary flex-1" onClick={stopSpeaking}>
            <Icon name="VolumeX" size={18} />
            {t('stop')}
          </button>
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => setNotice(t('demoAlertsNote'))}
          >
            <Icon name="Info" size={18} />
            {t('demoLabel')}
          </button>
        </div>

        <Disclaimer icon="TriangleAlert" tone="caution">
          {t('demoAlertsNote')}
        </Disclaimer>
      </div>
    </div>
  )
}

function AlertCard({ alert, t, L, isRead, isSpeaking, onRead, onToggleRead }) {
  const lvl = LEVELS[alert.level] || LEVELS.low
  return (
    <Card className={`overflow-hidden border-2 p-0 ${lvl.ring} ${isRead ? 'opacity-70' : ''}`}>
      <div className="relative">
        <img src={alertImage(alert.type)} alt="" className="h-32 w-full object-cover sm:h-40" loading="lazy" />
        <span className={`absolute right-3 top-3 chip ${lvl.chip} shadow-card`}>
          <Icon name={lvl.icon} size={13} />
          {t(lvl.key)}
        </span>
      </div>
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
          alert.level === 'high' ? 'bg-urgent text-white' : alert.level === 'medium' ? 'bg-caution text-[#4d3200]' : 'bg-calm text-white'
        }`}>
          <Icon name={alert.icon} size={22} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-base font-bold leading-tight text-forest">{L(alert.title)}</h3>
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-earth">
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {L(alert.time)}
            </span>
            {alert.crop ? (
              <span className="flex items-center gap-1">
                <Icon name="Wheat" size={12} />
                {t('affectedCrop')}: {L(alert.crop)}
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Icon name={alert.type === 'weather' ? 'CloudRain' : alert.type === 'disease' ? 'Bug' : 'Droplets'} size={12} />
              {t(TYPE_KEYS[alert.type])}
            </span>
          </p>

          <p className="mt-2 text-sm leading-relaxed text-forest/90">{L(alert.body)}</p>

          {alert.symptoms ? (
            <div className="mt-3 rounded-2xl bg-cream p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{t('symptomsToCheck')}</p>
              <p className="mt-1 text-sm text-earth">{L(alert.symptoms)}</p>
            </div>
          ) : null}

          <div className="mt-3 rounded-2xl border-l-4 border-leaf bg-sprout/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{t('recommendedAction')}</p>
            <p className="mt-1 text-sm text-forest">{L(alert.action)}</p>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn-secondary flex-1" onClick={onRead}>
              <Icon name={isSpeaking ? 'Loader' : 'Volume2'} size={18} />
              {t('readAloud')}
            </button>
            <button type="button" className={isRead ? 'btn-ghost flex-1' : 'btn-primary flex-1'} onClick={onToggleRead}>
              <Icon name={isRead ? 'CircleCheck' : 'Check'} size={18} />
              {isRead ? t('read') : t('markAsRead')}
            </button>
          </div>

          {isRead ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-calm">
              <Icon name="CircleCheck" size={13} />
              {t('read')}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
