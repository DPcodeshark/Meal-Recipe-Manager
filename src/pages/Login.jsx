import { useState } from 'react'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { MEMBER_COLORS, MEMBER_EMOJI, getMemberEmoji } from '../utils/constants'

const DEFAULT_MEMBERS = [
  { name: 'Erika', role: 'mom', emoji: MEMBER_EMOJI.Erika },
  { name: 'Merrill', role: 'dad', emoji: MEMBER_EMOJI.Merrill },
  { name: 'Cory', role: 'son', emoji: MEMBER_EMOJI.Cory },
  { name: 'Avery', role: 'son', emoji: MEMBER_EMOJI.Avery },
  { name: 'Radek', role: 'son', emoji: MEMBER_EMOJI.Radek },
]

export default function Login() {
  const { login, isDemo } = useFamily()
  const [step, setStep] = useState('pin')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [familyDoc, setFamilyDoc] = useState(null)
  const [creating, setCreating] = useState(false)

  async function handlePinSubmit(e) {
    e.preventDefault()
    setError('')
    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }

    if (isDemo) {
      setFamilyDoc({ id: 'demo-family', name: 'Our Family', members: DEFAULT_MEMBERS })
      setStep('pick')
      return
    }

    try {
      const q = query(collection(db, 'families'), where('pin', '==', pin))
      const snap = await getDocs(q)

      if (!snap.empty) {
        const doc = snap.docs[0]
        setFamilyDoc({ id: doc.id, ...doc.data() })
        setStep('pick')
      } else {
        setCreating(true)
      }
    } catch (err) {
      setError('Connection error. Check Firebase config.')
      console.error(err)
    }
  }

  async function handleCreate() {
    if (isDemo) {
      setFamilyDoc({ id: 'demo-family', name: 'Our Family', members: DEFAULT_MEMBERS })
      setCreating(false)
      setStep('pick')
      return
    }

    const docRef = await addDoc(collection(db, 'families'), {
      name: 'Our Family',
      pin,
      members: DEFAULT_MEMBERS,
      createdAt: new Date().toISOString(),
    })
    setFamilyDoc({ id: docRef.id, name: 'Our Family', members: DEFAULT_MEMBERS })
    setCreating(false)
    setStep('pick')
  }

  function handleMemberPick(member) {
    login(familyDoc.id, member)
  }

  if (step === 'pick' && familyDoc) {
    return (
      <div className="login-page">
        <span className="login-emoji" aria-hidden="true">👋</span>
        <h1>Who's cooking?</h1>
        <p className="subtitle">Tap your name to get started</p>
        <div className="member-grid">
          {familyDoc.members.map((m) => {
            const avatar = getMemberEmoji(m)
            const isEmoji = avatar && avatar.length <= 4 && avatar !== m.name[0]?.toUpperCase()
            return (
              <button
                key={m.name}
                className="member-btn"
                style={{ '--member-color': MEMBER_COLORS[m.name] || '#6b7280' }}
                onClick={() => handleMemberPick(m)}
              >
                <span className={`member-avatar${isEmoji ? ' is-emoji' : ''}`}>{avatar}</span>
                <span className="member-name">{m.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <span className="login-emoji" aria-hidden="true">🍲</span>
      <h1>Dinner App</h1>
      <p className="subtitle">What's for dinner tonight?</p>

      <form onSubmit={handlePinSubmit} className="pin-form">
        <label>Enter Family PIN</label>
        <input
          type="tel"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="4-digit PIN"
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        {isDemo && <p className="hint">Demo mode — enter any 4 digits</p>}
        <button type="submit" className="btn-primary">Enter</button>
      </form>

      {creating && (
        <div className="create-prompt">
          <p>No family found with this PIN. Create a new one?</p>
          <button onClick={handleCreate} className="btn-primary">Create Family</button>
          <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
        </div>
      )}
    </div>
  )
}
