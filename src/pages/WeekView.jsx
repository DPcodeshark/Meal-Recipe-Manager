import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { getWeekId, getWeekDays, formatWeekRange } from '../utils/dates'
import { MEMBER_COLORS, CUISINE_EMOJI } from '../utils/constants'

const initialOf = (name) => (name && name[0] ? name[0].toUpperCase() : '?')
import { addDays, format } from 'date-fns'
import {
  ChevronLeft, ChevronRight, X, BookOpen, CalendarPlus, Search, Star
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function WeekView() {
  const { familyId, family, currentMember } = useFamily()
  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)
  const [numWeeks, setNumWeeks] = useState(2)
  const [weekPlans, setWeekPlans] = useState({})
  const [libraryMeals, setLibraryMeals] = useState([])
  const [mealSearch, setMealSearch] = useState('')
  const [assigning, setAssigning] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [assigneePickerFor, setAssigneePickerFor] = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)
  const assigneePickerRef = useRef(null)

  const memberByName = (name) => family?.members?.find(m => m.name === name)
  const mealByName = (name) => libraryMeals.find(m => m.name?.toLowerCase() === name?.toLowerCase())

  useEffect(() => {
    if (!assigneePickerFor) return
    function onDown(e) {
      if (assigneePickerRef.current && !assigneePickerRef.current.contains(e.target)) {
        setAssigneePickerFor(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [assigneePickerFor])

  async function assignMemberToDate(memberName, dateStr) {
    const weekId = getWeekIdForDate(dateStr)
    const weekRef = doc(db, 'families', familyId, 'weeks', weekId)
    const snap = await getDoc(weekRef)
    const existing = snap.exists() ? snap.data() : { days: {} }
    existing.days[dateStr] = { ...existing.days[dateStr], assignedTo: memberName || null }
    await setDoc(weekRef, existing)
    setAssigneePickerFor(null)
  }

  const baseDate = addDays(new Date(), weekOffset * 7)
  const weeks = Array.from({ length: numWeeks }, (_, i) => {
    const d = addDays(baseDate, i * 7)
    const id = getWeekId(d)
    return { weekId: id, days: getWeekDays(id), label: formatWeekRange(id) }
  })

  useEffect(() => {
    if (!familyId) return
    const unsubs = weeks.map(w => {
      const ref = doc(db, 'families', familyId, 'weeks', w.weekId)
      return onSnapshot(ref, snap => {
        setWeekPlans(prev => ({
          ...prev,
          [w.weekId]: snap.exists() ? snap.data() : { days: {} },
        }))
      })
    })
    return () => unsubs.forEach(u => u())
  }, [familyId, weekOffset, numWeeks])

  useEffect(() => {
    if (!familyId) return
    const unsub = onSnapshot(collection(db, 'families', familyId, 'meals'), snap => {
      setLibraryMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [familyId])

  function getSlot(weekId, dateStr) {
    return weekPlans[weekId]?.days?.[dateStr] || {}
  }

  async function assignToDate(mealName, dateStr) {
    if (!mealName) return
    const weekId = getWeekIdForDate(dateStr)
    const weekRef = doc(db, 'families', familyId, 'weeks', weekId)
    const snap = await getDoc(weekRef)
    const existing = snap.exists() ? snap.data() : { days: {} }
    existing.days[dateStr] = { ...existing.days[dateStr], meal: mealName }
    await setDoc(weekRef, existing)
    setAssigning(null)
  }

  async function clearMeal(weekId, dateStr) {
    const weekRef = doc(db, 'families', familyId, 'weeks', weekId)
    const snap = await getDoc(weekRef)
    if (!snap.exists()) return
    const existing = snap.data()
    if (existing.days[dateStr]) {
      existing.days[dateStr] = { ...existing.days[dateStr], meal: null }
      await setDoc(weekRef, existing)
    }
  }

  function getWeekIdForDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    return format(monday, 'yyyy-MM-dd')
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  const filteredMeals = libraryMeals
    .filter(m => !mealSearch.trim() || m.name.toLowerCase().includes(mealSearch.trim().toLowerCase()))
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return a.name.localeCompare(b.name)
    })

  return (
    <div className={`planner ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="planner-main">
        <div className="week-header">
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="btn-icon">
            <ChevronLeft size={20} />
          </button>
          <h2>Meal Planner</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="btn-icon">
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`btn-icon ${sidebarOpen ? 'active' : ''}`}
              title="Toggle meal list"
            >
              <BookOpen size={18} />
            </button>
          </div>
        </div>

        {weeks.map(week => (
          <div key={week.weekId} className="week-block">
            <h3 className="week-label">{week.label}</h3>
            <div className="day-cards compact">
              {week.days.map(day => {
                const slot = getSlot(week.weekId, day.date)
                const color = MEMBER_COLORS[slot.assignedTo] || 'transparent'
                const isToday = day.date === today
                const isAssignTarget = assigning !== null
                const meal = slot.meal ? mealByName(slot.meal) : null
                const cuisineEmoji = meal?.cuisine ? CUISINE_EMOJI[meal.cuisine] : null
                const assigneeMember = slot.assignedTo ? memberByName(slot.assignedTo) : null
                const pickerOpen = assigneePickerFor === day.date

                return (
                  <div
                    key={day.date}
                    className={`day-card compact clickable ${isToday ? 'today' : ''} ${isAssignTarget ? 'assign-target' : ''} ${dragOverDate === day.date ? 'drag-over' : ''}`}
                    style={{ '--accent': color, '--member-color': color }}
                    onClick={() => {
                      if (assigning) {
                        assignToDate(assigning, day.date)
                      } else {
                        navigate(`/day/${day.date}`)
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'copy'
                      if (dragOverDate !== day.date) setDragOverDate(day.date)
                    }}
                    onDragLeave={() => {
                      if (dragOverDate === day.date) setDragOverDate(null)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const mealName = e.dataTransfer.getData('text/plain')
                      setDragOverDate(null)
                      if (mealName) assignToDate(mealName, day.date)
                    }}
                  >
                    <div className="day-card-header compact">
                      <span className="day-name">{day.short}</span>
                      <span className="day-number">{day.dayOfMonth}</span>
                    </div>
                    <div className="day-card-body">
                      {slot.meal ? (
                        <>
                          {meal?.image ? (
                            <img
                              src={meal.image}
                              alt=""
                              className="day-card-thumb"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <span className="day-card-cuisine" aria-hidden="true">{cuisineEmoji || '🍽️'}</span>
                          )}
                          <span className="day-card-meal">{slot.meal}</span>
                        </>
                      ) : (
                        <span className="day-card-empty" aria-label="No meal planned">+</span>
                      )}
                    </div>
                    <div ref={pickerOpen ? assigneePickerRef : null}>
                      <button
                        type="button"
                        className={`day-card-assignee${assigneeMember ? '' : ' empty'}`}
                        title={assigneeMember ? `Cook: ${slot.assignedTo}` : 'Assign cook'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigneePickerFor(pickerOpen ? null : day.date)
                        }}
                      >
                        {assigneeMember ? initialOf(assigneeMember.name) : '?'}
                      </button>
                      {pickerOpen && (
                        <div className="assignee-picker" onClick={e => e.stopPropagation()}>
                          {(family?.members || []).map(member => {
                            const isActive = slot.assignedTo === member.name
                            return (
                              <button
                                key={member.name}
                                type="button"
                                className={`assignee-pick-btn${isActive ? ' active' : ''}`}
                                title={isActive ? `${member.name} — tap to unassign` : member.name}
                                style={{ '--member-color': MEMBER_COLORS[member.name] || 'var(--border)' }}
                                onClick={() => assignMemberToDate(isActive ? null : member.name, day.date)}
                              >
                                {initialOf(member.name)}
                              </button>
                            )
                          })}
                          {assigneeMember && (
                            <button
                              type="button"
                              className="assignee-pick-btn unassign"
                              title="No cook assigned"
                              onClick={() => assignMemberToDate(null, day.date)}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {slot.meal && (
                      <button
                        className="btn-icon btn-clear-meal"
                        onClick={(e) => { e.stopPropagation(); clearMeal(week.weekId, day.date) }}
                        title="Clear meal"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <button
          onClick={() => setNumWeeks(numWeeks + 1)}
          className="btn-secondary btn-sm load-more-weeks"
        >
          <CalendarPlus size={14} /> Show another week
        </button>
      </div>

      {sidebarOpen && (
        <div className="suggestions-sidebar">
          <div className="sidebar-header">
            <h3>Meals</h3>
            <span className="sidebar-count">{filteredMeals.length}</span>
          </div>

          <div className="sidebar-add">
            <div className="sidebar-add-row">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                value={mealSearch}
                onChange={e => setMealSearch(e.target.value)}
                placeholder="Search meals..."
              />
              {mealSearch && (
                <button className="btn-icon" onClick={() => setMealSearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {assigning && (
            <div className="assign-hint">
              Tap a day on the calendar to assign <strong>{assigning}</strong>
              <button className="btn-icon" onClick={() => setAssigning(null)}><X size={14} /></button>
            </div>
          )}

          <div className="sidebar-list">
            {filteredMeals.length === 0 && (
              <p className="sidebar-empty">
                {libraryMeals.length === 0 ? 'No meals in library. Import some from the Meals tab.' : 'No matches.'}
              </p>
            )}
            {filteredMeals.map(m => {
              const isActive = assigning === m.name
              const cuisineEmoji = m.cuisine ? CUISINE_EMOJI[m.cuisine] : null
              return (
                <button
                  key={m.id}
                  className={`sidebar-meal ${isActive ? 'assigning' : ''}`}
                  onClick={() => setAssigning(isActive ? null : m.name)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy'
                    e.dataTransfer.setData('text/plain', m.name)
                    setAssigning(m.name)
                  }}
                  onDragEnd={() => {
                    setAssigning(null)
                    setDragOverDate(null)
                  }}
                  title="Drag onto a day, or click then tap a day to assign"
                >
                  {m.image ? (
                    <img
                      src={m.image}
                      alt=""
                      className="sidebar-meal-thumb"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : cuisineEmoji ? (
                    <span className="sidebar-meal-emoji" aria-hidden="true">{cuisineEmoji}</span>
                  ) : null}
                  {m.favorite && <Star size={12} fill="#f59e0b" color="#f59e0b" />}
                  <span className="sidebar-meal-name">{m.name}</span>
                  {m.cuisine && <span className="cuisine-badge mini">{m.cuisine}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
