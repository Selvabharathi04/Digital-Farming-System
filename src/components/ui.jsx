import { Icon } from './Icons.jsx'

export function Card({ className = '', children, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`card p-4 sm:p-5 ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function SectionHeader({ icon, title, subtitle, right, className = '' }) {
  return (
    <div className={`mb-3 flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sprout/70 text-forest">
            <Icon name={icon} size={20} />
          </span>
        ) : null}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-earth">{subtitle}</p> : null}
        </div>
      </div>
      {right}
    </div>
  )
}

export function Badge({ tone = 'leaf', icon, children, className = '' }) {
  const tones = {
    leaf: 'bg-sprout/70 text-forest',
    sun: 'bg-sun/30 text-[#7a5400]',
    urgent: 'bg-urgent/12 text-urgent',
    caution: 'bg-caution/18 text-[#8a5b00]',
    calm: 'bg-calm/12 text-calm',
    earth: 'bg-earth/12 text-earth',
    plain: 'bg-white text-forest border border-sprout',
  }
  return (
    <span className={`chip ${tones[tone] || tones.leaf} ${className}`}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  )
}

export function Disclaimer({ children, icon = 'Info', tone = 'earth' }) {
  const tones = {
    earth: 'border-earth/25 bg-earth/5 text-earth',
    caution: 'border-caution/40 bg-caution/10 text-[#7a5400]',
    urgent: 'border-urgent/35 bg-urgent/8 text-urgent',
    leaf: 'border-leaf/30 bg-sprout/30 text-forest',
  }
  return (
    <div className={`flex items-start gap-2 rounded-2xl border px-3.5 py-3 text-sm ${tones[tone]}`}>
      <Icon name={icon} size={16} className="mt-0.5 shrink-0" />
      <p className="leading-relaxed">{children}</p>
    </div>
  )
}

export function InfoRow({ label, value, icon, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-3 border-b border-sprout/50 py-2.5 last:border-0 ${className}`}>
      <span className="flex items-center gap-2 text-sm text-earth">
        {icon ? <Icon name={icon} size={15} className="text-leaf" /> : null}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-forest">{value}</span>
    </div>
  )
}

export function ProgressBar({ value, tone = 'leaf', height = 10, label }) {
  const tones = { leaf: 'bg-leaf', forest: 'bg-forest', caution: 'bg-caution', urgent: 'bg-urgent', calm: 'bg-calm' }
  return (
    <div>
      <div className="w-full overflow-hidden rounded-full bg-sprout/60" style={{ height }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${tones[tone] || tones.leaf}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  )
}

export function EmptyState({ icon = 'SearchX', title, hint }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sprout px-4 py-10 text-center">
      <Icon name={icon} size={32} className="text-leaf" />
      <p className="font-semibold text-forest">{title}</p>
      {hint ? <p className="text-sm text-earth">{hint}</p> : null}
    </div>
  )
}

export function PageHeader({ title, subtitle, onBack, right, showBack = true, image }) {
  return (
    <header className="leaf-pattern rounded-b-[28px] bg-gradient-to-br from-forest to-leaf px-4 pb-6 pt-4 text-white shadow-soft sm:rounded-3xl sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-start gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-white/90 sm:text-base">{subtitle}</p> : null}
        </div>
        {right}
        {image ? (
          <img src={image} alt={title} loading="lazy" className="mt-4 h-32 w-full rounded-2xl object-cover sm:h-44" />
        ) : null}
      </div>
    </header>
  )
}

export function ChipToggle({ active, icon, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip min-h-[44px] border-2 px-4 transition ${
        active ? 'border-forest bg-forest text-white' : 'border-sprout bg-white text-forest hover:bg-sprout/40'
      } ${className}`}
    >
      {icon ? <Icon name={icon} size={15} /> : null}
      {label}
    </button>
  )
}

export function StatTile({ icon, label, value, tone = 'leaf' }) {
  const tones = {
    leaf: 'bg-sprout/50 text-forest',
    sun: 'bg-sun/25 text-[#7a5400]',
    earth: 'bg-earth/10 text-earth',
    calm: 'bg-calm/12 text-calm',
  }
  return (
    <div className={`rounded-2xl px-3 py-3 ${tones[tone] || tones.leaf}`}>
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
        <Icon name={icon} size={14} />
        {label}
      </span>
      <p className="mt-1 text-base font-bold leading-snug">{value}</p>
    </div>
  )
}

/** Simple inline bar chart used on the comparison page. */
export function BarChart({ groups, series }) {
  const max = Math.max(...groups.flatMap((g) => series.map((s) => g.values[s.key] || 0)), 1)
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-sm font-semibold text-forest">{group.label}</p>
          <div className="space-y-1.5">
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="w-20 shrink-0 truncate text-xs text-earth">{s.label}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-sprout/50">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${((group.values[s.key] || 0) / max) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-forest">{s.format(group.values[s.key])}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Tiny sparkline for market trends. */
export function Sparkline({ points, tone = '#388E3C' }) {
  if (!points?.length) return null
  const w = 100
  const h = 30
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = w / (points.length - 1 || 1)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${i * step},${h - ((p - min) / span) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
