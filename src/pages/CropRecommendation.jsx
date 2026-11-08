import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, InfoRow, PageHeader, ProgressBar, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DISTRICTS, SOIL_TYPES, WATER_SOURCES } from '../data/sampleData.js'
import { cropImage } from '../lib/images.js'
import { getCropById, inr, levelStyles, recommendCrops, scoreCrop } from '../lib/recommend.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function CropRecommendation() {
  const { t, L, lang, profile, hasProfile, compareIds, toggleCompare, setCompare, setSelectedCrop } = useApp()
  const navigate = useNavigate()
  const goBack = useGoBack('/dashboard')
  const [detailId, setDetailId] = useState('')

  const recs = useMemo(() => recommendCrops(profile, 3), [profile])
  const district = DISTRICTS.find((d) => d.id === profile.district)
  const soil = SOIL_TYPES.find((s) => s.id === profile.soil)
  const waters = WATER_SOURCES.filter((w) => profile.waterSources.includes(w.id))
  const detailCrop = detailId ? getCropById(detailId) : null

  if (!hasProfile) {
    return (
      <div className="animate-floatUp">
        <PageHeader title={t('bestCrops')} subtitle={t('bestCropsSub')} onBack={goBack} />
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
        title={t('bestCrops')}
        subtitle={t('bestCropsSub')}
        onBack={goBack}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Sparkles" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Farm details summary */}
        <Card>
          <Section
            icon="ClipboardList"
            title={t('yourFarmDetails')}
            right={
              <button type="button" className="chip bg-sprout/60 text-forest" onClick={() => navigate('/farm-profile')}>
                <Icon name="PenLine" size={14} />
                {t('changeFarmDetails')}
              </button>
            }
          />
          <div className="grid gap-x-6 sm:grid-cols-2">
            <InfoRow icon="Layers" label={t('sectionSoil')} value={soil ? t(soil.key) : '—'} />
            <InfoRow
              icon="Droplets"
              label={t('sectionWater')}
              value={waters.length ? waters.map((w) => t(w.key)).join(', ') : '—'}
            />
            <InfoRow icon="Ruler" label={t('sectionLandSize')} value={`${profile.landSize} ${t('acres')}`} />
            <InfoRow icon="MapPin" label={t('sectionLocation')} value={profile.locationLabel || L(district) || '—'} />
          </div>
        </Card>

        {/* Recommendations */}
        {recs.map((rec, index) => (
          <RecommendationCard
            key={rec.crop.id}
            rec={rec}
            rank={index + 1}
            t={t}
            L={L}
            lang={lang}
            compareIds={compareIds}
            onToggleCompare={() => toggleCompare(rec.crop.id)}
            onDetails={() => setDetailId(rec.crop.id)}
            onChoose={() => {
              setSelectedCrop(rec.crop.id)
              navigate('/plan')
            }}
          />
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/compare" className="btn-primary">
            <Icon name="Scale" size={19} />
            {t('compareCrops')}
            {compareIds.length ? ` (${compareIds.length})` : ''}
          </Link>
          <button type="button" className="btn-secondary" onClick={() => navigate('/farm-profile')}>
            <Icon name="PenLine" size={19} />
            {t('changeFarmDetails')}
          </button>
        </div>

        {compareIds.length >= 2 ? (
          <button
            type="button"
            className="btn-ghost w-full text-sm"
            onClick={() => {
              setCompare([])
            }}
          >
            <Icon name="Trash2" size={16} />
            {t('changeSelection')}
          </button>
        ) : null}

        <Disclaimer icon="Info">{t('matchDisclaimer')}</Disclaimer>
        <Disclaimer icon="TriangleAlert" tone="caution">
          {t('suitabilityDisclaimer')}
        </Disclaimer>
      </div>

      {detailCrop ? (
        <DetailSheet
          crop={detailCrop}
          score={scoreCrop(detailCrop, profile)}
          profile={profile}
          t={t}
          L={L}
          lang={lang}
          onClose={() => setDetailId('')}
          onChoose={() => {
            setSelectedCrop(detailCrop.id)
            navigate('/plan')
          }}
        />
      ) : null}
    </div>
  )
}

function RecommendationCard({ rec, rank, t, L, lang, compareIds, onToggleCompare, onDetails, onChoose }) {
  const { crop, match, level, reason, aspects } = rec
  const styles = levelStyles(level)
  const inCompare = compareIds.includes(crop.id)

  return (
    <Card className={`overflow-hidden p-0 ${styles.border} border-2`}>
      <div className="relative">
        <img src={cropImage(crop)} alt={L(crop)} className="h-44 w-full object-cover sm:h-56" loading="lazy" />
        <span className="absolute left-3 top-3 grid h-9 min-w-9 place-items-center rounded-full bg-forest px-2 text-sm font-bold text-white shadow-soft">
          #{rank}
        </span>
        <span className={`absolute right-3 top-3 chip ${styles.bg} ${styles.text} bg-white font-bold shadow-card`}>
          <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
          {t(styles.key)}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold leading-tight text-forest">
              <span className="mr-1.5" aria-hidden="true">{crop.emoji}</span>
              {L(crop)}
            </h3>
            <p className="mt-0.5 text-sm text-earth">{L(crop.weather)}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold leading-none text-calm">{match}%</p>
            <p className="text-[11px] uppercase tracking-wide text-earth">{t('matchPercent')}</p>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={match} tone={level === 'good' ? 'calm' : level === 'caution' ? 'caution' : 'urgent'} label={t('matchPercent')} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile icon="Droplets" label={t('waterRequirement')} value={L(crop.waterNeed)} />
          <Tile icon="CalendarDays" label={t('growingDuration')} value={L(crop.duration)} />
          <Tile icon="Wallet" label={t('expectedInvestment')} value={inr(crop.investment)} />
          <Tile icon="TrendingUp" label={t('estimatedProfit')} value={inr(crop.profit)} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile icon="Wheat" label={t('expectedYield')} value={`${crop.yieldQuintal} qtl`} />
          <Tile icon="BadgeIndianRupee" label={t('sampleMarketPrice')} value={`${inr(crop.pricePerQuintal)}/qtl`} />
          <Tile icon="Store" label={t('marketDemand')} value={t(crop.demand)} />
          <Tile icon="Leaf" label={t('soilSuitability')} value={`${aspects.soil}%`} />
        </div>

        <div className={`mt-4 rounded-2xl p-3.5 ${styles.bg}`}>
          <p className={`text-sm leading-relaxed ${styles.text}`}>
            <span className="font-semibold">{t('cropSuitability')}: </span>
            {L(reason)}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button type="button" className="btn-primary flex-1" onClick={onDetails}>
            <Icon name="Eye" size={18} />
            {t('viewDetails')}
          </button>
          <button
            type="button"
            className={inCompare ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
            onClick={onToggleCompare}
          >
            <Icon name={inCompare ? 'Check' : 'Scale'} size={18} />
            {inCompare ? t('removeFromCompare') : t('addToCompare')}
          </button>
          <button type="button" className="btn-secondary flex-1" onClick={onChoose}>
            <Icon name="Sprout" size={18} />
            {t('chooseThisCrop')}
          </button>
        </div>
      </div>
    </Card>
  )
}

function Tile({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-cream p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-leaf">
        <Icon name={icon} size={13} />
        {label}
      </p>
      <p className="mt-1 text-sm font-bold leading-snug text-forest">{value}</p>
    </div>
  )
}

function DetailSheet({ crop, score, profile, t, L, lang, onClose, onChoose }) {
  const styles = levelStyles(score.level)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest/50 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[26px] bg-white shadow-soft sm:rounded-[26px]">
        <img src={cropImage(crop)} alt={L(crop)} className="h-44 w-full object-cover" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold text-forest">
              {crop.emoji} {L(crop)}
            </h3>
            <button type="button" onClick={onClose} aria-label={t('close')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-forest">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className={`mt-3 flex items-center gap-3 rounded-2xl p-3.5 ${styles.bg}`}>
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-lg font-extrabold ${styles.text}`}>
              {score.match}%
            </span>
            <div>
              <p className={`font-semibold ${styles.text}`}>{t(styles.key)}</p>
              <p className="text-sm text-earth">{L(score.reason)}</p>
            </div>
          </div>

          <div className="mt-4">
            <InfoRow icon="Droplets" label={t('waterRequirement')} value={L(crop.waterNeed)} />
            <InfoRow icon="Ruler" label={t('sectionLandSize')} value={`${profile.landSize} ${t('acres')}`} />
            <InfoRow icon="CalendarDays" label={t('growingDuration')} value={L(crop.duration)} />
            <InfoRow icon="Wallet" label={t('expectedInvestment')} value={inr(crop.investment)} />
            <InfoRow icon="Wheat" label={t('expectedYield')} value={`${crop.yieldQuintal} qtl / ${t('acres').toLowerCase()}`} />
            <InfoRow icon="BadgeIndianRupee" label={t('sampleMarketPrice')} value={`${inr(crop.pricePerQuintal)} / qtl`} />
            <InfoRow icon="TrendingUp" label={t('estimatedProfit')} value={inr(crop.profit)} />
            <InfoRow icon="RefreshCw" label={t('toCropRotation')} value={L(crop.rotation)} />
          </div>

          <div className="mt-4 space-y-3">
            <Disclaimer icon="Info">{t('financialDisclaimer')}</Disclaimer>
          </div>

          <div className="mt-4 flex gap-2.5">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              {t('close')}
            </button>
            <button type="button" className="btn-primary flex-1" onClick={onChoose}>
              <Icon name="Sprout" size={18} />
              {t('chooseThisCrop')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
