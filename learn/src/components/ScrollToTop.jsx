import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scrolls to the top on every route change. React Router doesn't do this
// automatically because the page never actually reloaded — it just swapped
// components. Without this, clicking "Next" at the bottom of one lesson
// drops you in the middle of the next one.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
