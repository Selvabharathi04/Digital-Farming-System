import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, InfoRow, PageHeader, ProgressBar, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { FERTILIZER_REMINDERS, IRRIGATION, PLAN_STAGES } from '../data/sampleData.js'
import { cropImage } from '../lib/images.js'
import { getCropById, recommendCrops } from '../lib/recommend.js'
import { useGoBack } from '../lib/useGoBack.js'

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date, lang) {
  return date.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CropPlan() {
  const { t, L, lang, profile, selectedCropId, completedStages, toggleStage, reminders, addReminder, removeReminder, setSelectedCrop } = useApp()
  const navigate = useNavigate()
  const goBack = useGoBack('/recommend')
  const [notice, setNotice] = useState('')

  const crop = getCropById(selectedCropId)
  const sowingDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d
  }, [])

  const alternatives = useMemo(() => recommendCrops(profile, 3).filter((r) => r.crop.id !== selectedCropId), [profile, selectedCropId])
  const progress = Math.round((completedStages.length / PLAN_STAGES.length) * 100)

  if (!crop) {
    return (
      <div className="animate-floatUp">
        <PageHeader title={t('yourFarmingPlan')} subtitle={t('planSub')} onBack={goBack} />
        <div className="px-4 pt-6 sm:px-6">
          <Card className="text-center">
            <Icon name="Sprout" size={34} className="mx-auto text-leaf" />
            <p className="mt-3 font-semibold text-forest">{t('selectedCrop')} — {t('noCropsSelected')}</p>
            <button type="button" className="btn-primary mt-4 w-full" onClick={() => navigate('/recommend')}>
              <Icon name="Wheat" size={18} />
              {t('backToRecommendations')}
            </button>
          </Card>
        </div>
      </div>
    )
  }

  const nextStage = PLAN_STAGES.find((s) => !completedStages.includes(s.id))

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('yourFarmingPlan')}
        subtitle={t('planSub')}
        onBack={goBack}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="CalendarDays" size={14} />
            {progress}%
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Selected crop */}
        <Card className="overflow-hidden p-0">
          <div className="relative">
            <img src={cropImage(crop)} alt={L(crop)} className="h-40 w-full object-cover sm:h-52" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/90 to-transparent p-4 pt-10 text-white">
              <p className="text-xs uppercase tracking-wide text-white/80">{t('selectedCrop')}</p>
              <h2 className="text-xl font-bold sm:text-2xl">
                {crop.emoji} {L(crop)}
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid gap-x-6 sm:grid-cols-2">
              <InfoRow icon="CalendarPlus" label={t('sampleSowingDate')} value={formatDate(sowingDate, lang)} />
              <InfoRow icon="CalendarDays" label={t('growingDuration')} value={L(crop.duration)} />
              <InfoRow icon="Wheat" label={t('expectedHarvestPeriod')} value={formatDate(addDays(sowingDate, durationDays(crop)), lang)} />
              <InfoRow icon="Droplets" label={t('waterRequirement')} value={L(crop.waterNeed)} />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-forest">{t('progress')}</span>
                <span className="text-earth">
                  {completedStages.length}/{PLAN_STAGES.length} {t('completed')}
                </span>
              </div>
              <ProgressBar value={progress} tone="calm" label={t('progress')} />
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => {
                  addReminder({ id: `crop-${crop.id}`, label: t('cropCalendar'), date: formatDate(sowingDate, lang) })
                  setNotice(t('reminderAdded'))
                }}
              >
                <Icon name="BellPlus" size={18} />
                {t('addReminder')}
              </button>
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => {
                  const stage = nextStage || PLAN_STAGES[PLAN_STAGES.length - 1]
                  toggleStage(stage.id)
                  setNotice('')
                }}
              >
                <Icon name="CircleCheckBig" size={18} />
                {t('markCompleted')}
              </button>
              <Link to="/disease" className="btn-secondary flex-1">
                <Icon name="BookOpen" size={18} />
                {t('viewCropGuide')}
              </Link>
            </div>

            {notice ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-calm">
                <Icon name="CircleCheck" size={16} />
                {notice}
              </p>
            ) : null}
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <Section icon="GitCommitVertical" title={t('farmingTimeline')} subtitle={t('planSub')} />
          <ol className="relative ml-4 border-l-2 border-dashed border-sprout pl-6">
            {PLAN_STAGES.map((stage) => {
              const done = completedStages.includes(stage.id)
              const date = addDays(sowingDate, stage.offset)
              return (
                <li key={stage.id} className="mb-4 last:mb-0">
                  <span
                    className={`absolute -left-[19px] grid h-9 w-9 place-items-center rounded-full border-2 ${
                      done ? 'border-calm bg-calm text-white' : 'border-sprout bg-white text-leaf'
                    }`}
                    style={{ marginTop: 2 }}
                  >
                    <Icon name={done ? 'Check' : stage.icon} size={17} />
                  </span>

                  <div className={`rounded-2xl border-2 p-3.5 ${done ? 'border-calm/40 bg-calm/5' : 'border-sprout bg-cream'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight text-forest">{t(stage.key)}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-earth">
                          <Icon name="CalendarDays" size={13} />
                          {formatDate(date, lang)}
                        </p>
                      </div>
                      <Badge tone={done ? 'calm' : 'plain'} icon={done ? 'CircleCheck' : 'Clock'}>
                        {done ? t('completed') : t('pending')}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-earth">{L(stage.instruction)}</p>

                    <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-2xl bg-white px-3 py-2">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleStage(stage.id)}
                        className="h-5 w-5 accent-[#2E7D32]"
                      />
                      <span className="text-sm font-semibold text-forest">{t('markCompleted')}</span>
                    </label>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>

        {/* Irrigation schedule */}
        <Card>
          <Section icon="Droplets" title={t('irrigationSchedule')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard icon="Droplets" tone="leaf" title={t('recommendedIrrigation')} body={L(IRRIGATION.requirement)} />
            <TipCard icon="CloudRain" tone="blue" title={t('rainfallConsideration')} body={L(IRRIGATION.rainfall)} />
            <TipCard icon="Save" tone="sun" title={t('waterSavingTip')} body={t('tipAdjustRain')} />
            <TipCard
              icon="CalendarCheck"
              tone="calm"
              title={t('nextIrrigation')}
              body={formatDate(new Date(IRRIGATION.nextDate), lang)}
            />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-earth">
              <span>{t('waterLevel')}</span>
              <span>{IRRIGATION.level}%</span>
            </div>
            <ProgressBar value={IRRIGATION.level} tone="leaf" label={t('waterLevel')} />
          </div>
          <Link to="/irrigation" className="btn-secondary mt-4 w-full">
            <Icon name="ArrowRight" size={18} />
            {t('irrigationTitle')}
          </Link>
        </Card>

        {/* Fertilizer reminders */}
        <Card>
          <Section icon="FlaskConical" title={t('fertilizerReminders')} />
          <div className="space-y-3">
            {FERTILIZER_REMINDERS.map((f) => (
              <div key={f.id} className="rounded-2xl border-2 border-sprout bg-cream p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-forest">{L(f.stage)}</p>
                    <p className="text-xs text-earth">
                      {t('timing')}: {L(f.timing)}
                    </p>
                  </div>
                  <Badge tone="sun" icon="CalendarDays">
                    {formatDate(new Date(f.date), lang)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-earth">{L(f.note)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="chip min-h-[40px] bg-white px-3 text-forest"
                    onClick={() => {
                      if (reminders.some((r) => r.id === f.id)) {
                        removeReminder(f.id)
                      } else {
                        addReminder({ id: f.id, label: `${t('fertilizerReminders')} — ${L(f.stage)}`, date: formatDate(new Date(f.date), lang) })
                        setNotice(t('reminderAdded'))
                      }
                    }}
                  >
                    <Icon name={reminders.some((r) => r.id === f.id) ? 'BellOff' : 'BellPlus'} size={15} />
                    {reminders.some((r) => r.id === f.id) ? t('removeFromCompare') : t('addReminder')}
                  </button>
                  <span className="text-xs text-earth">{t('reminderDate')}: {formatDate(new Date(f.date), lang)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Disclaimer icon="TriangleAlert" tone="caution">
              {t('fertilizerDisclaimer')}
            </Disclaimer>
          </div>
        </Card>

        {/* Crop rotation */}
        <Card>
          <Section icon="RefreshCw" title={t('planNextSeason')} />
          <div className="flex items-start gap-3 rounded-2xl bg-sprout/40 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-forest">
              <Icon name="Sprout" size={22} />
            </span>
            <div>
              <p className="font-semibold text-forest">{L(crop.rotation)}</p>
              <p className="mt-1 text-sm leading-relaxed text-earth">
                {lang === 'ta'
                  ? 'இந்த பயிர் மண் வளத்தை மீட்டெடுக்க உதவும். அடுத்த பருவத்தில் பயிர் சுழற்சி செய்வது நோய் மற்றும் பூச்சி அபாயத்தைக் குறைக்கும்.'
                  : 'A follow-up crop helps restore soil nutrients. Rotating crops reduces pest and disease build-up in the same field.'}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Disclaimer icon="Info">{t('rotationDisclaimer')}</Disclaimer>
          </div>
          {alternatives.length ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-forest">{t('toCropRotation')}</p>
              <div className="flex flex-wrap gap-2">
                {alternatives.map((alt) => (
                  <button
                    key={alt.crop.id}
                    type="button"
                    className="chip min-h-[40px] border-2 border-sprout bg-white px-3 text-forest"
                    onClick={() => {
                      setSelectedCrop(alt.crop.id)
                      setNotice(t('farmSaved'))
                    }}
                  >
                    <Icon name="Shuffle" size={14} />
                    {alt.crop.emoji} {L(alt.crop)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        {/* Reminders list */}
        {reminders.length ? (
          <Card>
            <Section icon="Bell" title={t('reminders')} subtitle={`${reminders.length}`} />
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2.5">
                  <Icon name="BellRing" size={16} className="text-leaf" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-forest">{r.label}</span>
                    <span className="block text-xs text-earth">{r.date}</span>
                  </span>
                  <button type="button" onClick={() => removeReminder(r.id)} aria-label={t('removeFromCompare')} className="grid h-9 w-9 place-items-center rounded-full bg-white text-earth">
                    <Icon name="Trash2" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

function TipCard({ icon, tone, title, body }) {
  const tones = {
    leaf: 'bg-sprout/40 text-forest',
    blue: 'bg-[#E3F2FD] text-[#0d47a1]',
    sun: 'bg-sun/20 text-[#7a5400]',
    calm: 'bg-calm/10 text-calm',
  }
  return (
    <div className={`rounded-2xl p-3.5 ${tones[tone] || tones.leaf}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        <Icon name={icon} size={14} />
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

/** Approximate the crop duration in days from the bilingual label. */
function durationDays(crop) {
  const match = String(crop.duration.en).match(/(\d+)/)
  return match ? Number(match[1]) : 120
}
