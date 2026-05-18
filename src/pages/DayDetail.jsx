import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { MEMBER_COLORS } from '../utils/constants'
import { format } from 'date-fns'
import { ThumbsUp, ThumbsDown, Minus, ArrowLeft, Plus, X } from 'lucide-react'

function fuzzyMatch(text, query) {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t.includes(q)) return 2
  const words = q.split(/\s+/)
  if (words.every(w => t.includes(w))) return 1
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length ? 0.5 : 0
}

export default function DayDetail() {
  const { date } = useParams()
  const { familyId, family, currentMember } = useFamily()
  const [dayData, setDayData] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [newSuggestion, setNewSuggestion] = useState('')
  const [showAssign, setShowAssign] = useState(false)
  const [libraryMeals, setLibraryMeals] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const autocompleteRef = useRef(null)

  const dayLabel = format(new Date(date + 'T00:00:00'), 'EEEE, MMM d')
  const weekId = getWeekIdFromDate(date)

  function getWeekIdFromDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return format(monday, 'yyyy-MM-dd')
  }

  useEffect(() => {
    if (!familyId) return
    const weekRef = doc(db, 'families', familyId, 'weeks', weekId)
    const unsub = onSnapshot(weekRef, (snap) => {
      if (snap.exists()) {
        setDayData(snap.data().days?.[date] || {})
        setSuggestions(snap.data().days?.[date]?.suggestions || [])
      }
    })
    return unsub
  }, [familyId, weekId, date])

  useEffect(() => {
    if (!familyId) return
    const unsub = onSnapshot(collection(db, 'families', familyId, 'meals'), (snap) => {
      setLibraryMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [familyId])

  useEffect(() => {
    function handleClickOutside(e) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const autocompleteResults = newSuggestion.trim().length >= 2
    ? libraryMeals
        .map(m => ({ ...m, score: fuzzyMatch(m.name, newSuggestion.trim()) }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    : []

  async function updateDay(updates) {
    const weekRef = doc(db, 'families', familyId, 'weeks', weekId)
    const snap = await getDoc(weekRef)
    const existing = snap.exists() ? snap.data() : { days: {} }
    existing.days[date] = { ...existing.days[date], ...updates }
    await setDoc(weekRef, existing)
  }

  async function assignMember(memberName) {
    await updateDay({ assignedTo: memberName })
    setShowAssign(false)
  }

  async function addSuggestion(e) {
    e.preventDefault()
    if (!newSuggestion.trim()) return
    const updated = [
      ...suggestions,
      {
        id: Date.now().toString(),
        meal: newSuggestion.trim(),
        suggestedBy: currentMember.name,
        votes: {},
      }
    ]
    await updateDay({ suggestions: updated })
    setNewSuggestion('')
  }

  async function vote(suggestionId, value) {
    const updated = suggestions.map(s => {
      if (s.id === suggestionId) {
        return { ...s, votes: { ...s.votes, [currentMember.name]: value } }
      }
      return s
    })
    await updateDay({ suggestions: updated })
  }

  async function pickMeal(mealName) {
    await updateDay({ meal: mealName })
  }

  async function removeSuggestion(suggestionId) {
    const updated = suggestions.filter(s => s.id !== suggestionId)
    await updateDay({ suggestions: updated })
  }

  async function clearMeal() {
    await updateDay({ meal: null })
  }

  function getVoteCounts(suggestion) {
    const votes = Object.values(suggestion.votes || {})
    return {
      up: votes.filter(v => v === 'up').length,
      down: votes.filter(v => v === 'down').length,
      neutral: votes.filter(v => v === 'neutral').length,
    }
  }

  return (
    <div className="day-detail">
      <div className="day-detail-header">
        <Link to="/" className="btn-icon"><ArrowLeft size={20} /></Link>
        <h2>{dayLabel}</h2>
      </div>

      <section className="assignment-section">
        <h3>Assigned to</h3>
        {dayData.assignedTo ? (
          <div className="assigned-member" onClick={() => setShowAssign(true)}>
            <span
              className="member-dot"
              style={{ background: MEMBER_COLORS[dayData.assignedTo] }}
            />
            <span>{dayData.assignedTo}</span>
            <span className="tap-change">tap to change</span>
          </div>
        ) : (
          <button onClick={() => setShowAssign(true)} className="btn-secondary">
            Assign someone
          </button>
        )}
        {showAssign && (
          <div className="member-picker">
            {family.members.map(m => (
              <button
                key={m.name}
                onClick={() => assignMember(m.name)}
                style={{ '--member-color': MEMBER_COLORS[m.name] }}
                className="member-pick-btn"
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {dayData.meal && (
        <section className="chosen-meal">
          <h3>Tonight's Meal</h3>
          <div className="meal-card chosen">
            <span>{dayData.meal}</span>
            {dayData.assignedTo === currentMember.name && (
              <button className="btn-icon btn-danger" onClick={clearMeal} title="Clear pick">
                <X size={16} />
              </button>
            )}
          </div>
        </section>
      )}

      <section className="suggestions-section">
        <h3>Suggestions</h3>
        <div className="suggestion-form-wrapper" ref={autocompleteRef}>
          <form onSubmit={addSuggestion} className="suggestion-form">
            <input
              value={newSuggestion}
              onChange={(e) => { setNewSuggestion(e.target.value); setShowAutocomplete(true) }}
              onFocus={() => setShowAutocomplete(true)}
              placeholder="Suggest a meal..."
            />
            <button type="submit" className="btn-icon"><Plus size={20} /></button>
          </form>
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div className="autocomplete-dropdown">
              {autocompleteResults.map(m => (
                <button
                  key={m.id}
                  className="autocomplete-item"
                  onClick={() => {
                    setNewSuggestion(m.name)
                    setShowAutocomplete(false)
                  }}
                >
                  <span className="autocomplete-name">{m.name}</span>
                  {m.cuisine && <span className="cuisine-badge">{m.cuisine}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="suggestion-list">
          {suggestions
            .sort((a, b) => {
              const aScore = getVoteCounts(a).up - getVoteCounts(a).down
              const bScore = getVoteCounts(b).up - getVoteCounts(b).down
              return bScore - aScore
            })
            .map(s => {
              const counts = getVoteCounts(s)
              const myVote = s.votes?.[currentMember.name]
              return (
                <div key={s.id} className="suggestion-card">
                  <div className="suggestion-info">
                    <span className="suggestion-meal">{s.meal}</span>
                    <span className="suggested-by">by {s.suggestedBy}</span>
                  </div>
                  {s.suggestedBy === currentMember.name && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => removeSuggestion(s.id)}
                      title="Remove suggestion"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="vote-buttons">
                    <button
                      className={`vote-btn ${myVote === 'up' ? 'active-up' : ''}`}
                      onClick={() => vote(s.id, myVote === 'up' ? null : 'up')}
                    >
                      <ThumbsUp size={16} /> {counts.up || ''}
                    </button>
                    <button
                      className={`vote-btn ${myVote === 'neutral' ? 'active-neutral' : ''}`}
                      onClick={() => vote(s.id, myVote === 'neutral' ? null : 'neutral')}
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      className={`vote-btn ${myVote === 'down' ? 'active-down' : ''}`}
                      onClick={() => vote(s.id, myVote === 'down' ? null : 'down')}
                    >
                      <ThumbsDown size={16} /> {counts.down || ''}
                    </button>
                  </div>
                  {dayData.assignedTo === currentMember.name && !dayData.meal && (
                    <button
                      className="btn-pick"
                      onClick={() => pickMeal(s.meal)}
                    >
                      Pick this
                    </button>
                  )}
                </div>
              )
            })}
        </div>
      </section>

      <Link to="/" className="btn-secondary return-to-calendar">
        <ArrowLeft size={16} /> Return to Calendar
      </Link>
    </div>
  )
}
