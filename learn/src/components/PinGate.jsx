import { useState } from 'react'
import { Lock } from 'lucide-react'
import { LEARN_PIN } from '../config.js'

const STORAGE_KEY = 'learnUnlocked'

export default function PinGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (input === LEARN_PIN) {
      localStorage.setItem(STORAGE_KEY, '1')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (unlocked) return children

  return (
    <div className="pin-gate">
      <div className="pin-gate-card">
        <span className="pin-gate-icon" aria-hidden="true"><Lock size={28} /></span>
        <h1>Zavods Learn</h1>
        <p className="pin-gate-lede">
          This is a private learning guide for the Zavod family. Enter the
          PIN your uncle gave you to continue.
        </p>
        <form onSubmit={submit} className="pin-gate-form">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={input}
            onChange={(e) => {
              setInput(e.target.value.replace(/\D/g, ''))
              setError(false)
            }}
            placeholder="••••"
            autoFocus
            aria-label="4-digit PIN"
          />
          {error && <p className="pin-gate-error">Not quite. Try again.</p>}
          <button type="submit" disabled={input.length < 1}>
            Continue
          </button>
        </form>
        <p className="pin-gate-note">
          Forgot the PIN? Ask your uncle — he'll know.
        </p>
      </div>
    </div>
  )
}
