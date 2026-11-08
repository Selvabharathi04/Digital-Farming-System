import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons.jsx'
import { Logo } from '../components/Logo.jsx'
import { LanguageToggle } from '../components/Layout.jsx'
import { Disclaimer } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { LOGIN_IMAGE } from '../lib/images.js'

const COUNTRY_CODES = ['+91', '+94', '+971', '+65', '+1']
const DEMO_OTP = '1234'

export default function Login() {
  const { t, setLogin, lang } = useApp()
  const navigate = useNavigate()
  const [code, setCode] = useState('+91')
  const [mobile, setMobile] = useState('')
  const [step, setStep] = useState('mobile')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const otpRef = useRef(null)

  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus()
  }, [step])

  const sendOtp = () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError(t('invalidMobile'))
      return
    }
    setError('')
    setStep('otp')
    setOtp('')
  }

  const verify = () => {
    if (otp !== DEMO_OTP) {
      setError(t('invalidOtp'))
      return
    }
    setError('')
    setLogin({ isGuest: false, mobile: `${code}${mobile}` })
    navigate('/farm-profile')
  }

  const asGuest = () => {
    setLogin({ isGuest: true, mobile: '' })
    navigate('/farm-profile')
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="grid h-11 w-11 place-items-center rounded-full border-2 border-sprout bg-white text-forest" aria-label={t('back')}>
            <Icon name="ArrowLeft" size={20} />
          </Link>
          <LanguageToggle compact />
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={56} />
          <h1 className="mt-4 text-2xl font-bold text-forest sm:text-3xl">{t('welcomeBack')}</h1>
          <p className="mt-1 text-sm text-earth">{t('loginSub')}</p>
        </div>

        <img
          src={LOGIN_IMAGE}
          alt={t('appName')}
          loading="lazy"
          className="mb-5 h-32 w-full rounded-2xl object-cover sm:h-40"
        />

        <div className="card p-5">
          {step === 'mobile' ? (
            <>
              <label className="label" htmlFor="mobile">
                {t('mobileNumber')}
              </label>
              <div className="flex gap-2">
                <select
                  aria-label="Country code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="field w-28 shrink-0"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="field flex-1"
                />
              </div>

              {error ? <FieldError message={error} /> : null}

              <button type="button" className="btn-primary mt-4 w-full" onClick={sendOtp}>
                <Icon name="MessageSquareLock" size={19} />
                {t('sendOtp')}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-earth">
                {t('otpSentTo')} <span className="font-semibold text-forest">{code} {mobile}</span>
              </p>

              <label className="label mt-4" htmlFor="otp">
                {t('enterOtp')}
              </label>
              <input
                id="otp"
                ref={otpRef}
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="field text-center text-2xl font-bold tracking-[0.5em]"
                placeholder="----"
              />

              <div className="mt-3">
                <Disclaimer icon="Info" tone="caution">
                  {t('demoOtpHint')}
                </Disclaimer>
              </div>

              {error ? <FieldError message={error} /> : null}

              <button type="button" className="btn-primary mt-4 w-full" onClick={verify}>
                <Icon name="ShieldCheck" size={19} />
                {t('verifyContinue')}
              </button>

              <div className="mt-3 flex items-center justify-between text-sm">
                <button type="button" className="font-semibold text-leaf" onClick={() => { setStep('mobile'); setError('') }}>
                  {t('changeNumber')}
                </button>
                <button type="button" className="font-semibold text-leaf" onClick={() => { setOtp(''); setError('') }}>
                  {t('resendOtp')}
                </button>
              </div>
            </>
          )}

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-sprout" />
            <span className="text-xs uppercase tracking-wide text-earth">{t('optional')}</span>
            <span className="h-px flex-1 bg-sprout" />
          </div>

          <button type="button" className="btn-secondary w-full" onClick={asGuest}>
            <Icon name="UserRound" size={19} />
            {t('continueGuest')}
          </button>
        </div>

        <p className="mt-4 flex items-start justify-center gap-2 px-2 text-center text-xs text-earth">
          <Icon name="Lock" size={14} className="mt-0.5 shrink-0" />
          {t('privacyNote')}
        </p>
        <p className="mt-1 text-center text-xs text-earth">
          {lang === 'ta' ? 'பாதுகாப்பாகவும், எளிமையாகவும்.' : 'Simple and trustworthy — no passwords requested.'}
        </p>
      </div>
    </div>
  )
}

function FieldError({ message }) {
  return (
    <p className="mt-3 flex items-center gap-2 rounded-2xl bg-urgent/8 px-3 py-2 text-sm font-medium text-urgent">
      <Icon name="CircleAlert" size={16} />
      {message}
    </p>
  )
}
