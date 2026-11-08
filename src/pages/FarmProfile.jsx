import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import SearchableSelect from '../components/SearchableSelect.jsx'
import { Card, Disclaimer, PageHeader, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CROP_OPTIONS, DISTRICTS, SOIL_TYPES, WATER_SOURCES } from '../data/sampleData.js'
import { villagesForDistrict } from '../data/villages.js'
import { soilImage } from '../lib/images.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function FarmProfile() {
  const { t, L, lang, profile, setProfile, hasProfile } = useApp()
  const navigate = useNavigate()
  const goBack = useGoBack('/dashboard')

  const [form, setForm] = useState({ ...profile, landSize: profile.landSize || 2 })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [locationMsg, setLocationMsg] = useState('')

  const district = useMemo(() => DISTRICTS.find((d) => d.id === form.district) || null, [form.district])

  // Towns come first (they are bilingual and cover the district headquarters),
  // then every village panchayat of the district, grouped under its block.
  const districtVillages = useMemo(() => (district ? villagesForDistrict(district.id) : []), [district])

  const villageOptions = useMemo(() => {
    if (!district) return []
    const options = []
    const seen = new Set()
    for (const town of district.villages) {
      seen.add(town.en.toLowerCase())
      options.push({ id: town.en, en: town.en, ta: town.ta, group: t('townGroup') })
    }
    for (const village of districtVillages) {
      if (seen.has(village.name.toLowerCase())) continue
      seen.add(village.name.toLowerCase())
      options.push({
        id: village.name,
        en: village.name,
        group: lang === 'ta' && village.blockTa ? village.blockTa : village.block,
      })
    }
    return options
  }, [district, districtVillages, lang, t])

  const villageSourceNote = useMemo(() => {
    if (!district) return t('locationDemoNote')
    return districtVillages.length ? t('villagesSourceNote') : t('noVillagesForDistrict')
  }, [district, districtVillages, t])

  const update = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(patch).forEach((k) => delete next[k])
      return next
    })
    setSaved(false)
  }

  const toggleWater = (id) => {
    const list = form.waterSources.includes(id)
      ? form.waterSources.filter((w) => w !== id)
      : [...form.waterSources, id]
    update({ waterSources: list })
  }

  const step = (delta) => {
    const next = Math.min(50, Math.max(0.5, Math.round((Number(form.landSize || 0) + delta) * 2) / 2))
    update({ landSize: next })
  }

  const useMyLocation = () => {
    setLocationMsg('')
    if (!navigator.geolocation) {
      setLocationMsg(t('locationUnavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocationMsg(t('locationUnavailable')),
      () => setLocationMsg(t('locationUnavailable')),
      { timeout: 6000 },
    )
  }

  const validate = () => {
    const next = {}
    if (!form.district) next.district = t('errDistrict')
    if (!form.village) next.village = t('errVillage')
    if (!form.soil) next.soil = t('errSoil')
    if (!form.waterSources.length) next.waterSources = t('errWater')
    if (!form.landSize || Number(form.landSize) <= 0) next.landSize = t('errLandSize')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = () => {
    if (!validate()) {
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const districtObj = DISTRICTS.find((d) => d.id === form.district)
    setProfile({
      ...form,
      landSize: Number(form.landSize),
      locationLabel: `${form.village}, ${districtObj ? districtObj.en : ''}`.trim(),
    })
    setSaved(true)
    navigate('/dashboard')
  }

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('farmProfileTitle')}
        subtitle={t('farmProfileSub')}
        onBack={goBack}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="ClipboardList" size={14} />
            {t('demoData')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* Section A — Location */}
        <Card>
          <Section icon="MapPin" title={t('sectionLocation')} />
          <button type="button" className="btn-secondary w-full" onClick={useMyLocation}>
            <Icon name="LocateFixed" size={19} />
            {t('useMyLocation')}
          </button>

          {locationMsg ? (
            <div className="mt-3">
              <Disclaimer icon="TriangleAlert" tone="caution">
                {locationMsg}
              </Disclaimer>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div data-error={Boolean(errors.district)}>
              <label className="label" htmlFor="district">
                {t('selectDistrict')}
              </label>
              <SearchableSelect
                id="district"
                options={DISTRICTS.map((d) => ({ id: d.id, en: d.en, ta: d.ta }))}
                value={form.district}
                onChange={(v) => update({ district: v, village: '' })}
                placeholder={t('searchDistrictPlaceholder')}
                lang={lang}
                icon="Building2"
                allowClear
                alwaysSearch
              />
              {errors.district ? <ErrorText message={errors.district} /> : null}
            </div>

            <div data-error={Boolean(errors.village)}>
              <label className="label" htmlFor="village">
                {t('selectVillage')}
              </label>
              <SearchableSelect
                id="village"
                options={villageOptions}
                value={form.village}
                onChange={(v) => update({ village: v })}
                placeholder={form.district ? t('searchVillagePlaceholder') : t('selectDistrict')}
                lang={lang}
                icon="Trees"
                disabled={!form.district}
                allowClear
                alwaysSearch
                moreHint={t('narrowSearchHint')}
              />
              {errors.village ? <ErrorText message={errors.village} /> : null}
            </div>
          </div>

          <p className="mt-3 text-xs text-earth">{villageSourceNote}</p>
        </Card>

        {/* Section B — Land size */}
        <Card>
          <Section icon="Ruler" title={t('sectionLandSize')} subtitle={t('landSizeHint')} />
          <div className="flex items-center gap-4" data-error={Boolean(errors.landSize)}>
            <button type="button" aria-label="Decrease" onClick={() => step(-0.5)} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-forest bg-white text-forest transition hover:bg-sprout/50 active:scale-95">
              <Icon name="Minus" size={26} />
            </button>
            <div className="flex-1 rounded-2xl border-2 border-sprout bg-cream px-4 py-3 text-center">
              <p className="text-3xl font-bold text-forest">{form.landSize}</p>
              <p className="text-xs uppercase tracking-wide text-earth">{t('acres')}</p>
            </div>
            <button type="button" aria-label="Increase" onClick={() => step(0.5)} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-forest bg-forest text-white transition hover:bg-leaf active:scale-95">
              <Icon name="Plus" size={26} />
            </button>
          </div>
          {errors.landSize ? <ErrorText message={errors.landSize} /> : null}
        </Card>

        {/* Section C — Soil type */}
        <Card>
          <Section icon="Layers" title={t('sectionSoil')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-error={Boolean(errors.soil)}>
            {SOIL_TYPES.map((soil) => {
              const active = form.soil === soil.id
              return (
                <button
                  key={soil.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ soil: soil.id })}
                  className={`relative overflow-hidden rounded-2xl border-2 bg-white text-left transition ${
                    active ? 'border-forest shadow-soft' : 'border-sprout hover:border-leaf/60'
                  }`}
                >
                  <img src={soilImage(soil.id)} alt={t(soil.key)} className="h-20 w-full object-cover" loading="lazy" />
                  <span className="block px-3 py-2.5">
                    <span className="block text-sm font-semibold leading-tight text-forest">{t(soil.key)}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-earth">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: soil.color }} />
                      {active ? t('selected') : t('optional')}
                    </span>
                  </span>
                  {active ? (
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-forest text-white">
                      <Icon name="Check" size={15} />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          {errors.soil ? <ErrorText message={errors.soil} /> : null}
        </Card>

        {/* Section D — Water source */}
        <Card>
          <Section icon="Droplets" title={t('sectionWater')} subtitle={t('waterMultiHint')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-error={Boolean(errors.waterSources)}>
            {WATER_SOURCES.map((w) => {
              const active = form.waterSources.includes(w.id)
              return (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleWater(w.id)}
                  className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition ${
                    active ? 'border-forest bg-sprout/50 text-forest' : 'border-sprout bg-white text-earth hover:border-leaf/60'
                  }`}
                >
                  <Icon name={w.icon} size={26} className={active ? 'text-forest' : 'text-leaf'} />
                  <span className="text-sm font-semibold leading-tight">{t(w.key)}</span>
                  {active ? (
                    <span className="chip bg-forest px-2 py-0.5 text-[10px] text-white">
                      <Icon name="Check" size={11} />
                      {t('selected')}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          {errors.waterSources ? <ErrorText message={errors.waterSources} /> : null}
        </Card>

        {/* Section E — Current/previous crop */}
        <Card>
          <Section icon="Wheat" title={t('sectionCrop')} subtitle={t('optional')} />
          <SearchableSelect
            id="previousCrop"
            options={CROP_OPTIONS}
            value={form.previousCrop}
            onChange={(v) => update({ previousCrop: v })}
            placeholder={t('cropSearchPlaceholder')}
            lang={lang}
            icon="Sprout"
            allowClear
          />
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button type="button" className="btn-primary flex-1" onClick={save}>
            <Icon name="Save" size={19} />
            {t('saveMyFarm')}
          </button>
          <button type="button" className="btn-secondary flex-1" onClick={goBack}>
            <Icon name="ArrowLeft" size={19} />
            {t('back')}
          </button>
        </div>

        {saved ? (
          <Disclaimer icon="CircleCheck" tone="leaf">
            {t('farmSaved')}
          </Disclaimer>
        ) : hasProfile ? (
          <Disclaimer icon="Info" tone="leaf">
            {t('farmSaved')}
          </Disclaimer>
        ) : null}
      </div>
    </div>
  )
}

function ErrorText({ message }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-urgent">
      <Icon name="CircleAlert" size={15} />
      {message}
    </p>
  )
}
