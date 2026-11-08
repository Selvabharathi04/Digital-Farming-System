import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, InfoRow, PageHeader, ProgressBar, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ALERTS, DISTRICTS, PLAN_STAGES, SCHEMES, SOIL_TYPES, WATER_SOURCES, IRRIGATION } from '../data/sampleData.js'
import { pageImage } from '../lib/images.js'
import { getCropById, levelStyles, recommendCrops } from '../lib/recommend.js'
import { copyText } from '../lib/speech.js'
import { useGoBack } from '../lib/useGoBack.js'

const STEP_KEYS = ['stepPrepareLand', 'stepFollowCalendar', 'stepMonitorWeather', 'stepCheckDisease', 'stepReviewMarket']

export default function Summary() {
  const { t, L, lang, profile, hasProfile, selectedCropId, completedStages, reminders, readAlerts } = useApp()
  const goBack = useGoBack('/dashboard')
  const navigate = useNavigate()
  const [checked, setChecked] = useState([])
  const [notice, setNotice] = useState('')

  const crop = getCropById(selectedCropId)
  const rec = useMemo(() => (crop ? recommendCrops(profile, 3).find((r) => r.crop.id === crop.id) : null), [crop, profile])
  const district = DISTRICTS.find((d) => d.id === profile.district)
  const soil = SOIL_TYPES.find((s) => s.id === profile.soil)
  const waters = WATER_SOURCES.filter((w) => profile.waterSources.includes(w.id))
  const nextStage = PLAN_STAGES.find((s) => !completedStages.includes(s.id)) || PLAN_STAGES[PLAN_STAGES.length - 1]
  const activeAlerts = ALERTS.filter((a) => !readAlerts.includes(a.id))
  const level = rec ? levelStyles(rec.level) : levelStyles('caution')

  const summaryText = useMemo(() => {
    const lines = [
      `${t('appName')} — ${t('farmSummary')}`,
      '',
      `${t('sectionLocation')}: ${profile.locationLabel || (district ? L(district) : '-')}`,
      `${t('sectionLandSize')}: ${profile.landSize} ${t('acres')}`,
      `${t('sectionSoil')}: ${soil ? t(soil.key) : '-'}`,
      `${t('sectionWater')}: ${waters.length ? waters.map((w) => t(w.key)).join(', ') : '-'}`,
      `${t('selectedCrop')}: ${crop ? L(crop) : '-'}`,
      `${t('cropSuitability')}: ${rec ? `${rec.match}% ${t(level.key)}` : '-'}`,
      `${t('nextFarmingTask')}: ${t(nextStage.key)}`,
      `${t('activeAlerts')}: ${activeAlerts.length}`,
      '',
      `${t('nextSteps')}:`,
      ...STEP_KEYS.map((k, i) => `${i + 1}. ${t(k)}`),
      '',
      t('thanksTitle'),
    ]
    return lines.join('\n')
  }, [t, L, profile, district, soil, waters, crop, rec, level, nextStage, activeAlerts])

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${t('appName')} — ${t('farmSummary')}`, text: summaryText })
        setNotice('')
        return
      }
    } catch {
      /* user dismissed the share sheet — fall back to copying */
    }
    const ok = await copyText(summaryText)
    setNotice(ok ? t('copiedToClipboard') : t('shareFailed'))
  }

  if (!hasProfile && !crop) {
    return (
      <div className="animate-floatUp">
        <PageHeader title={t('farmSummary')} subtitle={t('summarySub')} onBack={goBack} image={pageImage('summary')} />
        <div className="px-4 pt-6 sm:px-6">
          <Card className="text-center">
            <Icon name="ClipboardList" size={34} className="mx-auto text-leaf" />
            <p className="mt-3 font-semibold text-forest">{t('noProfileYet')}</p>
            <button type="button" className="btn-primary mt-4 w-full" onClick={() => navigate('/farm-profile')}>
              <Icon name="PenLine" size={18} />
              {t('farmProfileTitle')}
            </button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('farmSummary')}
        subtitle={t('summarySub')}
        onBack={goBack}
        image={pageImage('summary')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="ClipboardCheck" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Farm details */}
        <Card>
          <Section icon="MapPin" title={t('yourFarmDetails')} />
          <div className="grid gap-x-6 sm:grid-cols-2">
            <InfoRow icon="MapPin" label={t('sectionLocation')} value={profile.locationLabel || (district ? L(district) : '—')} />
            <InfoRow icon="Ruler" label={t('sectionLandSize')} value={`${profile.landSize} ${t('acres')}`} />
            <InfoRow icon="Layers" label={t('sectionSoil')} value={soil ? t(soil.key) : '—'} />
            <InfoRow
              icon="Droplets"
              label={t('sectionWater')}
              value={waters.length ? waters.map((w) => t(w.key)).join(', ') : '—'}
            />
            <InfoRow icon="Sprout" label={t('selectedCrop')} value={crop ? `${crop.emoji} ${L(crop)}` : '—'} />
            <InfoRow
              icon="Gauge"
              label={t('cropSuitability')}
              value={rec ? `${rec.match}% · ${t(level.key)}` : '—'}
            />
          </div>
          {rec ? (
            <div className="mt-3">
              <ProgressBar value={rec.match} tone={rec.level === 'good' ? 'calm' : rec.level === 'caution' ? 'caution' : 'urgent'} label={t('cropSuitability')} />
            </div>
          ) : null}
        </Card>

        {/* Next task + reminders + alerts */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <Section icon="CalendarCheck" title={t('nextFarmingTask')} />
            <p className="font-semibold text-forest">{t(nextStage.key)}</p>
            <p className="mt-1 text-sm text-earth">{L(nextStage.instruction)}</p>
            <Link to="/plan" className="btn-secondary mt-3 w-full">
              <Icon name="ArrowRight" size={17} />
              {t('yourFarmingPlan')}
            </Link>
          </Card>

          <Card>
            <Section icon="Bell" title={t('upcomingReminders')} />
            {reminders.length ? (
              <ul className="space-y-2">
                {reminders.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-start gap-2 text-sm">
                    <Icon name="BellRing" size={15} className="mt-0.5 shrink-0 text-leaf" />
                    <span>
                      <span className="block font-semibold text-forest">{r.label}</span>
                      <span className="block text-xs text-earth">{r.date}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-earth">
                {lang === 'ta' ? 'நினைவூட்டல்கள் இல்லை. பயிர் திட்டப் பக்கத்தில் சேர்க்கலாம்.' : 'No reminders yet. Add them from the crop plan page.'}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="sun" icon="Droplets">
                {t('nextIrrigation')}: {IRRIGATION.nextDate}
              </Badge>
            </div>
          </Card>

          <Card>
            <Section icon="BellRing" title={t('activeAlerts')} />
            {activeAlerts.length ? (
              <ul className="space-y-2">
                {activeAlerts.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-sm">
                    <Icon
                      name={a.level === 'high' ? 'OctagonAlert' : a.level === 'medium' ? 'TriangleAlert' : 'CircleCheck'}
                      size={15}
                      className={`mt-0.5 shrink-0 ${a.level === 'high' ? 'text-urgent' : a.level === 'medium' ? 'text-caution' : 'text-calm'}`}
                    />
                    <span className="font-medium text-forest">{L(a.title)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-earth">
                {lang === 'ta' ? 'படிக்காத எச்சரிக்கைகள் இல்லை.' : 'No unread alerts.'}
              </p>
            )}
            <Link to="/alerts" className="btn-secondary mt-3 w-full">
              <Icon name="ArrowRight" size={17} />
              {t('farmAlerts')}
            </Link>
          </Card>
        </div>

        {/* Next steps */}
        <Card>
          <Section icon="ListChecks" title={t('nextSteps')} subtitle={`${checked.length}/${STEP_KEYS.length}`} />
          <ol className="space-y-2">
            {STEP_KEYS.map((key, index) => {
              const done = checked.includes(key)
              return (
                <li key={key}>
                  <label
                    className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3 transition ${
                      done ? 'border-calm/40 bg-calm/5' : 'border-sprout bg-cream'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        done ? 'bg-calm text-white' : 'bg-white text-forest'
                      }`}
                    >
                      {done ? <Icon name="Check" size={16} /> : index + 1}
                    </span>
                    <span className={`flex-1 text-sm font-medium ${done ? 'text-earth line-through' : 'text-forest'}`}>{t(key)}</span>
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => setChecked((prev) => (done ? prev.filter((k) => k !== key) : [...prev, key]))}
                      className="h-5 w-5 accent-[#2E7D32]"
                    />
                  </label>
                </li>
              )
            })}
          </ol>
          <p className="mt-3 text-xs text-earth">
            {crop
              ? `${t('selectedCrop')}: ${L(crop)} — ${L(crop.duration)}`
              : lang === 'ta'
                ? 'பயிர் தேர்ந்தெடுக்கப்பட்டால் இந்த பட்டியல் அதற்கேற்ப மாறும்.'
                : 'This checklist adjusts according to your chosen crop.'}
          </p>
        </Card>

        {/* Expert help */}
        <Card>
          <Section icon="Headset" title={t('needExpertHelp')} />
          <div className="grid gap-3 sm:grid-cols-3">
            <ActionTile icon="MapPinned" title={t('findOffice')} hint={t('demoContactNote')} onClick={() => setNotice(t('demoContactNote'))} />
            <ActionTile icon="PhoneCall" title={t('callHelpline')} hint={t('demoContactNote')} onClick={() => setNotice(t('demoContactNote'))} />
            <ActionTile icon="Landmark" title={t('viewSchemes')} hint={t('schemesSub')} to="/schemes" />
          </div>
          <div className="mt-3">
            <Disclaimer icon="TriangleAlert" tone="caution">
              {t('demoContactNote')}
            </Disclaimer>
          </div>
        </Card>

        {/* Schemes preview */}
        <Card>
          <Section
            icon="Landmark"
            title={t('schemesTitle')}
            right={
              <Link to="/schemes" className="chip bg-sprout/60 text-forest">
                <Icon name="ArrowRight" size={14} />
                {t('learnMore')}
              </Link>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {SCHEMES.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-2xl border-2 border-sprout bg-cream p-3.5">
                <p className="font-semibold text-forest">
                  <span className="mr-1.5" aria-hidden="true">{s.emoji}</span>
                  {L(s.name)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-earth">{L(s.desc)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Disclaimer icon="Info">{t('eligibilityDisclaimer')}</Disclaimer>
          </div>
        </Card>

        {notice ? (
          <Disclaimer icon="CircleCheck" tone="leaf">
            {notice}
          </Disclaimer>
        ) : null}

        {/* Thanks */}
        <Card className="leaf-pattern bg-gradient-to-br from-forest to-leaf text-center text-white">
          <Icon name="Sprout" size={34} className="mx-auto" />
          <h2 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">{t('thanksTitle')}</h2>
          <p className="mt-2 text-sm text-white/90">
            {lang === 'ta'
              ? 'உங்கள் விவசாயம் செழிக்க வாழ்த்துகள்.'
              : 'Wishing you a healthy and profitable harvest.'}
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button type="button" className="btn flex-1 bg-white text-forest hover:bg-cream" onClick={() => navigate('/dashboard')}>
              <Icon name="Home" size={18} />
              {t('returnHome')}
            </button>
            <button type="button" className="btn flex-1 bg-white/20 text-white hover:bg-white/30" onClick={share}>
              <Icon name="Share2" size={18} />
              {t('shareSummary')}
            </button>
            <button type="button" className="btn flex-1 bg-white/20 text-white hover:bg-white/30" onClick={() => setNotice(t('demoContactNote'))}>
              <Icon name="LifeBuoy" size={18} />
              {t('getHelp')}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ActionTile({ icon, title, hint, to, onClick }) {
  const content = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sprout/60 text-forest">
        <Icon name={icon} size={21} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-forest">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-earth">{hint}</span>
      </span>
      <Icon name="ChevronRight" size={18} className="shrink-0 text-leaf" />
    </>
  )
  if (to) {
    return (
      <Link to={to} className="flex items-center gap-3 rounded-2xl border-2 border-sprout bg-cream p-3.5 transition hover:border-leaf">
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-2xl border-2 border-sprout bg-cream p-3.5 text-left transition hover:border-leaf">
      {content}
    </button>
  )
}
