import { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const cache = {}

export default function KeepAlive({ path, children }) {
  const location = useLocation()
  const isActive = location.pathname === path
  const [mounted, setMounted] = useState(isActive)

  useEffect(() => {
    if (isActive) setMounted(true)
  }, [isActive])

  if (!mounted) return null

  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      {children}
    </div>
  )
}
