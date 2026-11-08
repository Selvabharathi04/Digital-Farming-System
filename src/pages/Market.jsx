import { useMemo, useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, EmptyState, PageHeader, SectionHeader as Section, Sparkline } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CROP_OPTIONS, DISTRICTS, MARKET_PRICES } from '../data/sampleData.js'
import { pageImage } from '../lib/images.js'
import { inr } from '../lib/recommend.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function Market() {
  const { t, L, lang } = useApp()
  const goBack = useGoBack('/dashboard')
  const [cropFilter, setCropFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')

  const rows = useMemo(
    () =>
      MARKET_PRICES.filter((r) => (!cropFilter || r.cropId === cropFilter) && (!districtFilter || r.district === districtFilter)),
    [cropFilter, districtFilter],
  )

  const districtName = (id) => {
    const d = DISTRICTS.find((x) => x.id === id)
    return d ? L(d) : id
  }

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('marketTitle')}
        subtitle={t('marketSub')}
        onBack={goBack}
        image={pageImage('market')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="BadgeIndianRupee" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Filters */}
        <Card>
          <Section icon="SlidersHorizontal" title={t('filterCrop')} subtitle={t('marketDisclaimer')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cropFilter">
                {t('filterCrop')}
              </label>
              <select id="cropFilter" className="field" value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
                <option value="">{t('allCrops')}</option>
                {CROP_OPTIONS.filter((c) => MARKET_PRICES.some((m) => m.cropId === c.id)).map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'ta' ? c.ta : c.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="districtFilter">
                {t('filterDistrict')}
              </label>
              <select id="districtFilter" className="field" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
                <option value="">{t('allDistricts')}</option>
                {DISTRICTS.filter((d) => MARKET_PRICES.some((m) => m.district === d.id)).map((d) => (
                  <option key={d.id} value={d.id}>
                    {L(d)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(cropFilter || districtFilter) && (
            <button
              type="button"
              className="btn-ghost mt-2 w-full text-sm"
              onClick={() => {
                setCropFilter('')
                setDistrictFilter('')
              }}
            >
              <Icon name="RotateCcw" size={16} />
              {t('cancel')}
            </button>
          )}
        </Card>

        {/* Price cards */}
        {rows.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((row) => {
              const up = row.price >= row.prev
              const diff = row.price - row.prev
              const pct = Math.abs((diff / row.prev) * 100).toFixed(1)
              return (
                <Card key={`${row.cropId}-${row.district}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold leading-tight text-forest">{L(row.crop)}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-earth">
                        <Icon name="Store" size={13} />
                        {L(row.market)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-earth">
                        <Icon name="MapPin" size={13} />
                        {districtName(row.district)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold leading-none text-forest">{inr(row.price)}</p>
                      <p className="text-[11px] uppercase tracking-wide text-earth">{t('pricePerQuintal')}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`chip ${up ? 'bg-calm/15 text-calm' : 'bg-urgent/12 text-urgent'}`}>
                      <Icon name={up ? 'TrendingUp' : 'TrendingDown'} size={14} />
                      {up ? '+' : '−'}
                      {inr(Math.abs(diff))} ({pct}%)
                    </span>
                    <Badge tone="earth" icon="History">
                      {t('previousPrice')}: {inr(row.prev)}
                    </Badge>
                    <Badge tone={row.demand === 'high' ? 'calm' : 'sun'} icon="Store">
                      {t('demandIndicator')}: {t(row.demand)}
                    </Badge>
                  </div>

                  <div className="mt-3 rounded-2xl bg-cream p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-leaf">
                      <Icon name="ChartLine" size={13} />
                      {t('priceTrend')}
                    </p>
                    <Sparkline points={row.trend} tone={up ? '#2E7D32' : '#D32F2F'} />
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-earth">
                    <Icon name="Clock" size={12} />
                    {t('lastUpdated')}: {lang === 'ta' ? 'இன்று, காலை 8:00 (மாதிரி)' : 'Today, 8:00 AM (sample)'}
                  </p>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <EmptyState icon="SearchX" title={t('noResults')} />
          </Card>
        )}

        <Disclaimer icon="TriangleAlert" tone="caution">
          {t('marketDisclaimer')}
        </Disclaimer>
      </div>
    </div>
  )
}
