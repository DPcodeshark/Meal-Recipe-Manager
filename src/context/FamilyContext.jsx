import { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth, isDemo } from '../firebase/config'

const FamilyContext = createContext(null)

const DEMO_FAMILY = {
  id: 'demo-family',
  name: 'Our Family',
  pin: '1234',
  members: [
    { name: 'Erika', role: 'mom' },
    { name: 'Merrill', role: 'dad' },
    { name: 'Cory', role: 'son' },
    { name: 'Avery', role: 'son' },
    { name: 'Radek', role: 'son' },
  ],
}

export function FamilyProvider({ children }) {
  const [familyId, setFamilyId] = useState(() => localStorage.getItem('familyId'))
  const [currentMember, setCurrentMember] = useState(() => {
    const saved = localStorage.getItem('currentMember')
    return saved ? JSON.parse(saved) : null
  })
  const [family, setFamily] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo || !auth) {
      if (familyId === 'demo-family') setFamily(DEMO_FAMILY)
      setLoading(false)
      return
    }
    signInAnonymously(auth).catch((err) => {
      console.warn('Anonymous auth failed:', err.message)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!familyId) {
      setLoading(false)
      return
    }
    if (isDemo || !db) {
      if (familyId === 'demo-family') setFamily(DEMO_FAMILY)
      setLoading(false)
      return
    }
    const unsub = onSnapshot(doc(db, 'families', familyId), (snap) => {
      if (snap.exists()) {
        setFamily({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    })
    return unsub
  }, [familyId])

  useEffect(() => {
    const theme = family?.theme === 'midnight' ? 'midnight' : 'warm'
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'midnight' ? '#211c1a' : '#fdf8f1')
  }, [family?.theme])

  function login(fId, member) {
    setFamilyId(fId)
    setCurrentMember(member)
    if (isDemo) setFamily(DEMO_FAMILY)
    localStorage.setItem('familyId', fId)
    localStorage.setItem('currentMember', JSON.stringify(member))
  }

  function logout() {
    setFamilyId(null)
    setCurrentMember(null)
    setFamily(null)
    localStorage.removeItem('familyId')
    localStorage.removeItem('currentMember')
  }

  return (
    <FamilyContext.Provider value={{ familyId, family, currentMember, loading, login, logout, isDemo }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
