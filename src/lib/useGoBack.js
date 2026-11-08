import { useNavigate } from 'react-router-dom'

/** Back handler that falls back to a route when there is no history to pop. */
export function useGoBack(fallback = '/dashboard') {
  const navigate = useNavigate()
  return () => {
    if (window.history.length > 2) navigate(-1)
    else navigate(fallback)
  }
}
