import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo.jsx'
import { Icon } from '../components/Icons.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function NotFound() {
  const { t } = useApp()
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-3 w-fit">
          <Logo size={48} />
        </div>
        <p className="text-4xl font-bold text-forest">404</p>
        <p className="mt-1 text-sm text-earth">
          {t('appName')} — this screen was not found.
        </p>
        <Link to="/dashboard" className="btn-primary mt-5 w-full">
          <Icon name="Home" size={18} />
          {t('returnHome')}
        </Link>
      </div>
    </div>
  )
}
