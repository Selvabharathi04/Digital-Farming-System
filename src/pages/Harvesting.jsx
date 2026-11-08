import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, InfoRow, PageHeader, ProgressBar, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { HARVEST_GUIDE } from '../data/sampleData.js'
import { cropImage } from '../lib/images.js'
import { getCropById } from '../lib/recommend.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function Harvesting() {
  const { t, L, lang, selectedCropId } = useApp()
  const goBack = useGoBack('/dashboard')
  const [done, setDone] = useState([])
  const crop = getCropById(selectedCropId)
  const progress = Math.round((done.length / HARVEST_GUIDE.checklist.length) * 100)

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('harvestTitle')}
        subtitle={t('harvestDisclaimer')}
        onBack={goBack}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Wheat" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        <Card className="overflow-hidden p-0">
          {crop ? (
            <img src={cropImage(crop)} alt={L(crop)} className="h-40 w-full object-cover sm:h-52" loading="lazy" />
          ) : null}
          <div className="p-4 sm:p-5">
            <div className="grid gap-x-6 sm:grid-cols-2">
              <InfoRow icon="Sprout" label={t('selectedCrop')} value={crop ? `${crop.emoji} ${L(crop)}` : '—'} />
              <InfoRow icon="CalendarCheck" label={t('expectedHarvestPeriod')} value={L(HARVEST_GUIDE.period)} />
              <InfoRow icon="Wheat" label={t('expectedYield')} value={crop ? `${crop.yieldQuintal} qtl` : '—'} />
              <InfoRow icon="CalendarDays" label={t('growingDuration')} value={crop ? L(crop.duration) : '—'} />
            </div>
          </div>
        </Card>

        {/* Maturity signs */}
        <Card>
          <Section icon="Sprout" title={t('signsOfMaturity')} />
          <ul className="space-y-2.5">
            {HARVEST_GUIDE.maturity.map((m, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl bg-cream p-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sprout/70 text-sm font-bold text-forest">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-forest">{L(m)}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Checklist */}
        <Card>
          <Section
            icon="ListChecks"
            title={t('harvestChecklist')}
            right={<Badge tone="calm" icon="Gauge">{`${progress}%`}</Badge>}
          />
          <ProgressBar value={progress} tone="calm" label={t('harvestChecklist')} />
          <ul className="mt-4 space-y-2">
            {HARVEST_GUIDE.checklist.map((item, index) => {
              const isDone = done.includes(index)
              return (
                <li key={index}>
                  <label
                    className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3 transition ${
                      isDone ? 'border-calm/40 bg-calm/5' : 'border-sprout bg-cream'
                    }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isDone ? 'bg-calm text-white' : 'bg-white text-forest'}`}>
                      {isDone ? <Icon name="Check" size={16} /> : <Icon name="Circle" size={16} />}
                    </span>
                    <span className={`flex-1 text-sm font-medium ${isDone ? 'text-earth line-through' : 'text-forest'}`}>{L(item)}</span>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() =>
                        setDone((prev) => (isDone ? prev.filter((i) => i !== index) : [...prev, index]))
                      }
                      className="h-5 w-5 accent-[#2E7D32]"
                    />
                  </label>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Storage + losses */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Section icon="Warehouse" title={t('storageSuggestions')} />
            <ul className="space-y-2.5">
              {HARVEST_GUIDE.storage.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-forest">
                  <Icon name="PackageCheck" size={16} className="mt-0.5 shrink-0 text-leaf" />
                  {L(s)}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <Section icon="TrendingDown" title={t('reduceLosses')} />
            <ul className="space-y-2.5">
              {HARVEST_GUIDE.losses.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-forest">
                  <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0 text-caution" />
                  {L(s)}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Local expert */}
        <Card>
          <Section icon="Headset" title={t('localExpert')} />
          <p className="text-sm leading-relaxed text-earth">
            {lang === 'ta'
              ? 'அறுவடை, சேமிப்பு அல்லது சந்தைப்படுத்தல் குறித்த உதவிக்கு உங்கள் ஊர் வேளாண் அலுவலரை அணுகவும்.'
              : 'For help with harvesting, storage or marketing, contact your local agricultural officer.'}
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <Link to="/schemes" className="btn-secondary">
              <Icon name="Landmark" size={18} />
              {t('viewSchemes')}
            </Link>
            <Link to="/market" className="btn-secondary">
              <Icon name="BadgeIndianRupee" size={18} />
              {t('marketTitle')}
            </Link>
          </div>
        </Card>

        <Disclaimer icon="Info">{t('harvestDisclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
