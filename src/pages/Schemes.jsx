import { useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, PageHeader, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DISTRICTS, SCHEMES } from '../data/sampleData.js'
import { pageImage } from '../lib/images.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function Schemes() {
  const { t, L, lang } = useApp()
  const goBack = useGoBack('/summary')
  const [openId, setOpenId] = useState(SCHEMES[0].id)
  const [district, setDistrict] = useState('')

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('schemesTitle')}
        subtitle={t('schemesSub')}
        onBack={goBack}
        image={pageImage('schemes')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Landmark" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        {/* District selection for a future office directory */}
        <Card>
          <Section
            icon="MapPinned"
            title={t('findOffice')}
            subtitle={lang === 'ta' ? 'எதிர்கால அலுவலக அடைவுக்காக மாவட்டத்தைத் தேர்வு செய்யவும்.' : 'Select a district to be used for a future office directory.'}
          />
          <select className="field" aria-label={t('selectDistrict')} value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">{t('selectDistrict')}</option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {L(d)}
              </option>
            ))}
          </select>
          <div className="mt-3 flex flex-wrap gap-2">
            {district ? <Badge tone="leaf" icon="MapPin">{L(DISTRICTS.find((d) => d.id === district))}</Badge> : null}
            <Badge tone="caution" icon="TriangleAlert">{t('demoContactNote')}</Badge>
          </div>
        </Card>

        {/* Scheme cards */}
        <div className="space-y-3">
          {SCHEMES.map((s) => {
            const open = openId === s.id
            return (
              <Card key={s.id} className={open ? 'border-leaf' : ''}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? '' : s.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sprout/60 text-2xl" aria-hidden="true">
                    {s.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-tight text-forest">{L(s.name)}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-earth">{L(s.desc)}</span>
                  </span>
                  <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={20} className="mt-1 shrink-0 text-leaf" />
                </button>

                {open ? (
                  <div className="mt-3 space-y-3 border-t border-sprout pt-3">
                    <div className="rounded-2xl bg-cream p-3.5">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-leaf">
                        <Icon name="Users" size={14} />
                        {t('eligibilityInfo')}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-forest">{L(s.eligibility)}</p>
                    </div>
                    <div className="rounded-2xl bg-cream p-3.5">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-leaf">
                        <Icon name="FileText" size={14} />
                        {t('documentsRequired')}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-forest">{L(s.documents)}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary w-full"
                      onClick={() =>
                        window.alert(
                          lang === 'ta'
                            ? 'இது ஒரு டெமோ. விண்ணப்பம் சமர்ப்பிக்கப்படாது. உங்கள் உள்ளூர் வேளாண் அலுவலகத்தை அணுகவும்.'
                            : 'This is a demo. No application is submitted. Please contact your local agriculture office.',
                        )
                      }
                    >
                      <Icon name="ExternalLink" size={18} />
                      {t('learnMore')}
                    </button>
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>

        <Card>
          <Section icon="Sprout" title={t('toSchemes')} />
          <ul className="space-y-2.5 text-sm text-forest">
            <li className="flex items-start gap-2.5">
              <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-leaf" />
              {lang === 'ta' ? 'மண் பரிசோதனை செய்து மண் ஆரோக்கிய அட்டை பெறுங்கள்.' : 'Get a soil test done and collect your soil health card.'}
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-leaf" />
              {lang === 'ta' ? 'ஆதார் மற்றும் வங்கிக் கணக்கு விவரங்களை தயாராக வைக்கவும்.' : 'Keep Aadhaar and bank account details ready.'}
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-leaf" />
              {lang === 'ta' ? 'உள்ளூர் வேளாண் அலுவலகத்தில் தகுதியை உறுதிப்படுத்தவும்.' : 'Confirm your eligibility at the local agriculture office.'}
            </li>
          </ul>
        </Card>

        <Disclaimer icon="TriangleAlert" tone="caution">
          {t('eligibilityDisclaimer')}
        </Disclaimer>
      </div>
    </div>
  )
}
