import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Card, Disclaimer, EmptyState, PageHeader, BarChart, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { cropImage } from '../lib/images.js'
import { getCropById, inr, scoreCrop, waterCapacity } from '../lib/recommend.js'
import { useGoBack } from '../lib/useGoBack.js'

/** Row definitions: how to read the value and which direction is "best". */
const ROWS = [
  { key: 'soil', labelKey: 'soilSuitability', icon: 'Layers', dir: 'high', get: (c) => c.score.aspects.soil, fmt: (v) => `${v}%` },
  { key: 'water', labelKey: 'waterRequirement', icon: 'Droplets', dir: 'low', get: (c) => c.crop.waterLevel, fmt: (v, t) => `${v}%` },
  { key: 'duration', labelKey: 'growingDuration', icon: 'CalendarDays', dir: 'low', get: (c) => c.crop.days, fmt: (v, t, L, c) => L(c.crop.duration) },
  { key: 'yield', labelKey: 'expectedYield', icon: 'Wheat', dir: 'high', get: (c) => c.crop.yieldQuintal, fmt: (v) => `${v} qtl` },
  { key: 'cost', labelKey: 'cultivationCost', icon: 'Wallet', dir: 'low', get: (c) => c.crop.investment, fmt: (v) => inr(v) },
  { key: 'price', labelKey: 'sampleMarketPrice', icon: 'BadgeIndianRupee', dir: 'high', get: (c) => c.crop.pricePerQuintal, fmt: (v) => `${inr(v)}/qtl` },
  { key: 'profit', labelKey: 'estimatedProfit', icon: 'TrendingUp', dir: 'high', get: (c) => c.crop.profit, fmt: (v) => inr(v) },
  { key: 'weather', labelKey: 'weatherSuitability', icon: 'CloudSun', dir: 'high', get: (c) => c.score.aspects.weather, fmt: (v) => `${v}%` },
  { key: 'risk', labelKey: 'waterRisk', icon: 'TriangleAlert', dir: 'low', get: (c) => Math.max(0, c.crop.waterLevel - c.availableWater), fmt: (v) => `${v} pts` },
  { key: 'demand', labelKey: 'marketDemand', icon: 'Store', dir: 'high', get: (c) => c.score.aspects.market, fmt: (v) => `${v}%` },
]

export default function CropComparison() {
  const { t, L, profile, compareIds, setCompare, toggleCompare, setSelectedCrop } = useApp()
  const navigate = useNavigate()
  const goBack = useGoBack('/recommend')

  const items = useMemo(
    () =>
      compareIds
        .map((id) => getCropById(id))
        .filter(Boolean)
        .map((crop) => ({ crop, score: scoreCrop(crop, profile), availableWater: waterCapacity(profile.waterSources), days: durationDays(crop) })),
    [compareIds, profile],
  )

  const chartGroups = [
    { label: t('cultivationCost'), values: Object.fromEntries(items.map((i) => [i.crop.id, i.crop.investment])) },
    { label: t('expectedYield'), values: Object.fromEntries(items.map((i) => [i.crop.id, i.crop.yieldQuintal])) },
    { label: t('estimatedProfit'), values: Object.fromEntries(items.map((i) => [i.crop.id, i.crop.profit])) },
  ]

  const chartSeries = items.map((item, index) => ({
    key: item.crop.id,
    label: L(item.crop),
    color: ['bg-forest', 'bg-sun', 'bg-earth'][index] || 'bg-leaf',
    format: (v) => (Number(v) < 1000 ? `${v} qtl` : inr(v ?? 0)),
  }))

  const bestByRow = ROWS.reduce((acc, row) => {
    if (!items.length) return acc
    const values = items.map((i) => row.get(i))
    const best = row.dir === 'high' ? Math.max(...values) : Math.min(...values)
    acc[row.key] = best
    return acc
  }, {})

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('cropComparison')}
        subtitle={t('cropComparisonSub')}
        onBack={goBack}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Scale" size={14} />
            {items.length}/3
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {items.length < 2 ? (
          <Card>
            <EmptyState icon="Scale" title={t('noCropsSelected')} hint={t('selectToCompare')} />
            <Link to="/recommend" className="btn-primary mt-4 w-full">
              <Icon name="Wheat" size={19} />
              {t('backToRecommendations')}
            </Link>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden p-0">
              <div className="p-4 sm:p-5">
                <Section icon="Scale" title={t('selectToCompare')} subtitle={`${items.length} ${t('selectedCount')}`} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 w-40 bg-white p-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-leaf">
                        {t('cropComparison')}
                      </th>
                      {items.map((item) => (
                        <th key={item.crop.id} className="min-w-[170px] p-3 align-top">
                          <img
                            src={cropImage(item.crop, 'landscape_4_3')}
                            alt={L(item.crop)}
                            className="h-20 w-full rounded-2xl object-cover"
                            loading="lazy"
                          />
                          <p className="mt-2 text-left text-sm font-bold leading-tight text-forest">
                            {item.crop.emoji} {L(item.crop)}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-xs font-bold text-calm">{item.score.match}%</span>
                            <span className="text-[11px] text-earth">{t('matchPercent')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleCompare(item.crop.id)}
                            className="mt-2 inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-earth transition hover:bg-sprout/60"
                          >
                            <Icon name="X" size={12} />
                            {t('removeFromCompare')}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, rowIndex) => (
                      <tr key={row.key} className={rowIndex % 2 ? 'bg-cream/70' : 'bg-white'}>
                        <th className="sticky left-0 z-10 bg-inherit p-3 text-left align-top">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-forest">
                            <Icon name={row.icon} size={14} className="text-leaf" />
                            {t(row.labelKey)}
                          </span>
                        </th>
                        {items.map((item) => {
                          const value = row.get(item)
                          const isBest = items.length > 1 && value === bestByRow[row.key]
                          return (
                            <td key={item.crop.id} className="p-3 align-top">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isBest ? 'bg-calm/15 text-calm' : 'text-forest'
                                }`}
                              >
                                {isBest ? <Icon name="Trophy" size={13} /> : null}
                                {row.fmt(value, t, L, item)}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="flex items-center gap-1.5 border-t border-sprout px-4 py-2.5 text-xs text-earth">
                <Icon name="Info" size={13} />
                {t('scrollHint')} · <Icon name="Trophy" size={13} className="text-calm" /> {t('bestInCategory')}
              </p>
            </Card>

            {/* Choose buttons */}
            <div className="grid gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.crop.id}
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => {
                    setSelectedCrop(item.crop.id)
                    navigate('/plan')
                  }}
                >
                  <Icon name="Sprout" size={18} />
                  {t('chooseThisCrop')}
                  <span className="truncate text-sm font-normal opacity-90">· {L(item.crop)}</span>
                </button>
              ))}
            </div>

            {/* Bar chart */}
            <Card>
              <Section icon="BarChart3" title={t('chartTitle')} />
              <BarChart groups={chartGroups} series={chartSeries} />
              <div className="mt-4 flex flex-wrap gap-2">
                {chartSeries.map((s) => (
                  <span key={s.key} className="chip bg-cream text-forest">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    {s.label}
                  </span>
                ))}
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              <button type="button" className="btn-secondary" onClick={() => setCompare([])}>
                <Icon name="Shuffle" size={18} />
                {t('changeSelection')}
              </button>
              <Link to="/recommend" className="btn-secondary">
                <Icon name="ArrowLeft" size={18} />
                {t('backToRecommendations')}
              </Link>
              <button type="button" className="btn-ghost" onClick={goBack}>
                <Icon name="ArrowLeft" size={18} />
                {t('back')}
              </button>
            </div>

            <Disclaimer icon="TriangleAlert" tone="caution">
              {t('financialDisclaimer')}
            </Disclaimer>
            <Disclaimer icon="Info">{t('matchDisclaimer')}</Disclaimer>
          </>
        )}
      </div>
    </div>
  )
}

/** Convert the bilingual duration text into an approximate day count for sorting. */
function durationDays(crop) {
  const match = String(crop.duration.en).match(/(\d+)/)
  return match ? Number(match[1]) : 999
}
