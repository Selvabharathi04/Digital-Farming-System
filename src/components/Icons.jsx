import * as Lucide from 'lucide-react'

/**
 * Renders any Lucide icon by name. Keeping a single resolver means
 * pages can drive icons from sample data (weather, stages, alerts)
 * without importing each icon individually.
 */
export function Icon({ name, size = 24, className = '', strokeWidth = 2, ...rest }) {
  const Cmp = (name && Lucide[name]) || Lucide.Circle
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} {...rest} />
}

export default Lucide
