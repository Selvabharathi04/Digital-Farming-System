import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icons.jsx'

/**
 * Accessible searchable dropdown. `options` are objects with an `id`
 * plus the bilingual label fields described by `labelKeys`.
 *
 * Options may optionally carry a `group` string; when two neighbouring
 * options have different groups, the group name is rendered as a heading.
 *
 * Set `alwaysSearch` to keep the search input permanently visible instead of
 * hiding it behind a button — useful when the list is long.
 */
export default function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  emptyText = 'No results',
  disabled = false,
  labelKeys = ['en', 'ta'],
  lang = 'en',
  icon,
  allowClear = false,
  alwaysSearch = false,
  maxResults = 60,
  moreHint,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  const labelOf = (opt) => opt[labelKeys[0]] || ''
  const secondaryOf = (opt) => (Array.isArray(labelKeys) ? opt[labelKeys[1]] : opt[labelKeys])

  const selected = useMemo(() => options.find((o) => o.id === value) || null, [options, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => labelOf(o).toLowerCase().includes(q) || String(secondaryOf(o) || '').toLowerCase().includes(q),
    )
  }, [options, query])

  const visible = filtered.slice(0, maxResults)
  const truncated = filtered.length > visible.length

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const pick = (optId) => {
    onChange(optId)
    close()
  }

  const clearButton = (className) =>
    allowClear && selected ? (
      <button
        type="button"
        aria-label="Clear"
        onClick={(e) => {
          e.stopPropagation()
          onChange('')
        }}
        className={className}
      >
        <Icon name="X" size={13} />
      </button>
    ) : null

  const list = (
    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border-2 border-sprout bg-white shadow-soft">
      {alwaysSearch ? null : (
        <div className="border-b border-sprout/60 p-2">
          <div className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2">
            <Icon name="Search" size={16} className="text-leaf" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-forest outline-none"
            />
          </div>
        </div>
      )}
      <ul role="listbox" className="max-h-56 overflow-y-auto p-1">
        {visible.length ? (
          visible.map((opt, i) => {
            const active = opt.id === value
            const previousGroup = i > 0 ? visible[i - 1].group : null
            const showGroup = Boolean(opt.group) && opt.group !== previousGroup
            return (
              <Fragment key={opt.id}>
                {showGroup ? (
                  <li className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-leaf">
                    {opt.group}
                  </li>
                ) : null}
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(opt.id)}
                    className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm transition ${
                      active ? 'bg-forest text-white' : 'text-forest hover:bg-sprout/50'
                    }`}
                  >
                    <span className="truncate">
                      <span>{opt[lang] || opt.en}</span>
                      {opt.ta && lang === 'en' ? <span className="ml-2 text-xs opacity-70">{opt.ta}</span> : null}
                      {opt.hint ? (
                        <span className={`ml-2 text-xs ${active ? 'text-white/80' : 'text-earth'}`}>{opt.hint}</span>
                      ) : null}
                    </span>
                    {active ? <Icon name="Check" size={16} /> : null}
                  </button>
                </li>
              </Fragment>
            )
          })
        ) : (
          <li className="px-3 py-4 text-center text-sm text-earth">{emptyText}</li>
        )}
        {truncated && moreHint ? (
          <li className="px-3 pb-2 pt-3 text-center text-xs text-earth">{moreHint}</li>
        ) : null}
      </ul>
    </div>
  )

  if (alwaysSearch) {
    return (
      <div className="relative" ref={wrapRef}>
        <div className="relative">
          {icon ? (
            <Icon
              name={icon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-leaf"
            />
          ) : null}
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            autoComplete="off"
            disabled={disabled}
            value={open ? query : selected ? selected[lang] || selected.en : ''}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close()
            }}
            className={`field text-forest placeholder:text-earth/70 ${icon ? 'pl-9' : ''} ${
              allowClear && selected ? 'pr-16' : 'pr-9'
            } ${disabled ? 'opacity-60' : ''}`}
          />
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {clearButton('grid h-6 w-6 place-items-center rounded-full bg-sprout/70 text-forest')}
            <Icon name="Search" size={16} className="text-leaf" />
          </span>
        </div>
        {open ? list : null}
      </div>
    )
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`field flex items-center justify-between gap-2 text-left ${disabled ? 'opacity-60' : ''}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ? <Icon name={icon} size={16} className="shrink-0 text-leaf" /> : null}
          <span className={`truncate ${selected ? 'text-forest' : 'text-earth/70'}`}>
            {selected ? selected[lang] || selected.en : placeholder}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {clearButton('grid h-6 w-6 place-items-center rounded-full bg-sprout/70 text-forest')}
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-leaf" />
        </span>
      </button>

      {open ? list : null}
    </div>
  )
}
