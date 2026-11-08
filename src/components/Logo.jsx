/** Custom leaf-and-field logo mark. */
export function Logo({ size = 44, className = '' }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-forest to-leaf shadow-soft ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" width={size * 0.62} height={size * 0.62}>
        <path d="M6 40h36a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4z" fill="#FFC857" opacity="0.9" />
        <path d="M24 36c0-11 5-17 14-20-2 11-5 17-14 20z" fill="#C8E6C9" />
        <path d="M24 36c0-9-4-14-11-17 1.5 9 4 14 11 17z" fill="#FFFFFF" opacity="0.95" />
        <path d="M24 36V18" stroke="#FFC857" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function LogoLockup({ size = 44, title, tagline }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-tight text-forest">{title}</p>
        <p className="truncate text-xs text-earth">{tagline}</p>
      </div>
    </div>
  )
}
