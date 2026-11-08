import { useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Badge, Card, Disclaimer, PageHeader, SectionHeader as Section } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { DISEASES } from '../data/sampleData.js'
import { pageImage, diseaseImage } from '../lib/images.js'
import { speak } from '../lib/speech.js'
import { useGoBack } from '../lib/useGoBack.js'

export default function Disease() {
  const { t, L, lang } = useApp()
  const goBack = useGoBack('/dashboard')
  const [openId, setOpenId] = useState(DISEASES[0].id)
  const [notice, setNotice] = useState('')

  const readAloud = async (item) => {
    const text = [
      L(item.name),
      `${t('affectedCrop')}: ${L(item.crop)}`,
      `${t('commonSymptoms')}: ${L(item.symptoms)}`,
      `${t('preventiveMeasures')}: ${L(item.prevention)}`,
    ].join('. ')
    const result = await speak(text, lang)
    setNotice(result.ok ? '' : result.reason === 'no-voice' ? t('tamilSpeechUnavailable') : t('voiceUnsupported'))
  }

  return (
    <div className="animate-floatUp">
      <PageHeader
        title={t('diseaseTitle')}
        subtitle={t('diseaseSub')}
        onBack={goBack}
        image={pageImage('disease')}
        right={
          <span className="chip bg-white/20 text-white">
            <Icon name="Bug" size={14} />
            {t('demoLabel')}
          </span>
        }
      />

      <div className="space-y-5 px-4 pt-5 sm:px-6">
        <Card>
          <Section
            icon="BookOpen"
            title={t('commonDiseases')}
            subtitle={lang === 'ta' ? 'கல்வி நோக்கிலான மாதிரி தகவல்' : 'Educational sample information'}
          />
          <div className="space-y-3">
            {DISEASES.map((item) => {
              const open = openId === item.id
              return (
                <div key={item.id} className={`overflow-hidden rounded-2xl border-2 transition ${open ? 'border-leaf bg-white' : 'border-sprout bg-cream'}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? '' : item.id)}
                    className="flex min-h-[64px] w-full items-center gap-3 p-3.5 text-left"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-card" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-tight text-forest">{L(item.name)}</span>
                      <span className="mt-0.5 block text-xs text-earth">
                        {t('affectedCrop')}: {L(item.crop)}
                      </span>
                    </span>
                    <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={20} className="shrink-0 text-leaf" />
                  </button>

                  {open ? (
                    <div className="border-t border-sprout px-3.5 pb-3.5 pt-3">
                      <img
                        src={diseaseImage(item.id)}
                        alt={L(item.name)}
                        className="h-40 w-full rounded-2xl object-cover shadow-card"
                        loading="lazy"
                      />

                      <div className="mt-3 space-y-3">
                        <Block icon="Stethoscope" title={t('commonSymptoms')} body={L(item.symptoms)} tone="sun" />
                        <Block icon="ShieldCheck" title={t('preventiveMeasures')} body={L(item.prevention)} tone="leaf" />
                        <Block icon="Bug" title={t('pestManagement')} body={L(item.pest)} tone="earth" />
                        <Block
                          icon="PhoneCall"
                          title={t('whenToContact')}
                          body={
                            lang === 'ta'
                              ? 'பல செடிகள் பாதிக்கப்பட்டால், அல்லது 3–4 நாட்களில் நிலைமை மோசமானால், உங்கள் ஊர் வேளாண் அலுவலரை உடனே அணுகவும்.'
                              : 'Contact your local agricultural officer if many plants are affected, or if the problem worsens within 3–4 days.'
                          }
                          tone="urgent"
                        />
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <button type="button" className="btn-secondary flex-1" onClick={() => readAloud(item)}>
                          <Icon name="Volume2" size={18} />
                          {t('readAloud')}
                        </button>
                        <button
                          type="button"
                          className="btn-primary flex-1"
                          onClick={() => setNotice(
                            lang === 'ta'
                              ? 'இது ஒரு டெமோ. உண்மையான நிபுணர் தொடர்பு எண் இணைக்கப்படவில்லை.'
                              : 'This is a demo. No real expert contact channel is connected.',
                          )}
                        >
                          <Icon name="Headset" size={18} />
                          {t('contactExpert')}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Pest management guidance */}
        <Card>
          <Section icon="Worm" title={t('pestManagement')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Tip icon="Search" text={lang === 'ta' ? 'வாரத்திற்கு இரு முறை நிலத்தைச் சுற்றிப் பாருங்கள்.' : 'Inspect the field twice a week, early morning.'} />
            <Tip icon="Leaf" text={lang === 'ta' ? 'பாதிக்கப்பட்ட இலைகளை அகற்றி அழிக்கவும்.' : 'Remove and destroy badly affected leaves.'} />
            <Tip icon="Bug" text={lang === 'ta' ? 'இயற்கை எதிரிப் பூச்சிகளை ஊக்குவிக்கவும்.' : 'Encourage natural predators where possible.'} />
            <Tip icon="FlaskConical" text={lang === 'ta' ? 'தெளிப்பதற்கு முன் நிபுணர் ஆலோசனை பெறவும்.' : 'Ask an expert before any chemical application.'} />
          </div>
        </Card>

        {notice ? (
          <Disclaimer icon="TriangleAlert" tone="caution">
            {notice}
          </Disclaimer>
        ) : null}

        <Disclaimer icon="Info">{t('diseaseDisclaimer')}</Disclaimer>
      </div>
    </div>
  )
}

function Block({ icon, title, body, tone }) {
  const tones = {
    leaf: 'bg-sprout/40 text-forest',
    sun: 'bg-sun/20 text-[#7a5400]',
    earth: 'bg-earth/8 text-earth',
    urgent: 'bg-urgent/8 text-urgent',
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

function Tip({ icon, text }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-cream p-3.5">
      <Icon name={icon} size={16} className="mt-0.5 shrink-0 text-leaf" />
      <p className="text-sm leading-relaxed text-forest">{text}</p>
    </div>
  )
}
