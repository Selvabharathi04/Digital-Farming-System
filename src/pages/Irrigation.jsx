import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, InfoRow, PageHeader, ProgressBar, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { IRRIGATION, IRRIGATION_TIPS, WEATHER } from '../data/sampleData.js'
import { pageImage } from '../lib/images.js'
import { getCropById, waterCapacity } from '../lib/recommend.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function Irrigation() {
  const { t, L, lang, profile, selectedCropId } = useApp()
  const goBack = useGoBack('/dashboard')
  const crop = getCropById(selectedCropId)
  const capacity = waterCapacity(profile.waterSources)

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('irrigationTitle')}
        subtitle={t('featIrrigationDesc')}
        onBack={goBack}
        image={pageImage('irrigation')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Droplets" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Water indicator */}
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-[#E1F5FE] to-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                  <Icon name="Gauge" size={18} className="text-[#0277BD]" />
                  {t('waterLevel')}
                </p>
                <p className="mt-0.5 text-xs text-earth">
                  {crop ? `${t('selectedCrop')}: ${L(crop)}` : t('selectedCrop')}
                </p>
              </div>
              <Badge tone="caution" icon="FlaskConical">
                {t('sampleWeather')}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-4">
              {/* Simple vertical water tank visual */}
              <div className="relative h-28 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-[#4FC3F7] bg-white" aria-hidden="true">
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0288D1] to-[#4FC3F7] transition-all duration-700"
                  style={{ height: `${IRRIGATION.level}%` }}
                />
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs font-bold text-white mix-blend-difference">
                  {IRRIGATION.level}%
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-earth">
                    <span>{t('waterRequirement')}</span>
                    <span>{crop ? `${crop.waterLevel}%` : '—'}</span>
                  </div>
                  <ProgressBar value={crop ? crop.waterLevel : 50} tone="leaf" label={t('waterRequirement')} />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-earth">
                    <span>{lang === 'ta' ? 'உங்கள் நீர் வசதி' : 'Your water availability'}</span>
                    <span>{capacity}%</span>
                  </div>
                  <ProgressBar value={capacity} tone="forest" label={t('sectionWater')} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid gap-x-6 sm:grid-cols-2">
              <InfoRow icon="Sprout" label={t('cropGrowthStage')} value={L(IRRIGATION.stage)} />
              <InfoRow icon="Droplets" label={t('waterRequirementInfo')} value={L(IRRIGATION.requirement)} />
              <InfoRow icon="CloudRain" label={t('rainfallConsiderations')} value={L(IRRIGATION.rainfall)} />
              <InfoRow icon="CalendarCheck" label={t('nextIrrigation')} value={IRRIGATION.nextDate} />
              <InfoRow icon="Droplet" label={t('rainChance')} value={`${WEATHER.rainChance}%`} />
              <InfoRow icon="ThermometerSun" label={lang === 'ta' ? 'வெப்பநிலை' : 'Temperature'} value={`${WEATHER.temp}°C`} />
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card>
          <Section icon="Lightbulb" title={t('waterSavingTips')} />
          <ul className="space-y-2.5">
            {IRRIGATION_TIPS.map((key) => (
              <li key={key} className="flex items-start gap-3 rounded-2xl bg-cream p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-sprout/70 text-forest">
                  <Icon name="Check" size={17} />
                </span>
                <p className="text-sm leading-relaxed text-forest">{t(key)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Disclaimer icon="TriangleAlert" tone="caution">
          {t('irrigationDisclaimer')}
        </Disclaimer>
      </div>
    </div>
  )
}
