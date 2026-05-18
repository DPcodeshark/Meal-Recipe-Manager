import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, collection, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { getWeekId, getWeekDays } from '../utils/dates'
import { DEFAULT_AISLES } from '../utils/constants'
import { ShoppingCart, Check, Package, ChevronDown } from 'lucide-react'
import { addDays, format } from 'date-fns'

export default function GroceryList() {
  const { familyId, family } = useFamily()
  const [meals, setMeals] = useState([])
  const [pantry, setPantry] = useState([])
  const [listData, setListData] = useState({ checked: {}, aisles: {}, pantryFlags: {} })
  const [weekPlans, setWeekPlans] = useState({})
  const [editingAisle, setEditingAisle] = useState(null)
  const [numWeeks, setNumWeeks] = useState(1)
  const [aisleMap, setAisleMap] = useState({})
  const aislePickerRef = useRef(null)

  const aisles = family?.aisles || DEFAULT_AISLES

  useEffect(() => {
    if (!editingAisle) return
    function onDown(e) {
      if (aislePickerRef.current && !aislePickerRef.current.contains(e.target)) {
        setEditingAisle(null)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setEditingAisle(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [editingAisle])

  const weekIds = Array.from({ length: numWeeks }, (_, i) => {
    return getWeekId(addDays(new Date(), i * 7))
  })

  useEffect(() => {
    if (!familyId) return

    const mealsRef = collection(db, 'families', familyId, 'meals')
    const pantryRef = collection(db, 'families', familyId, 'pantry')

    const unsubs = [
      onSnapshot(mealsRef, snap => {
        setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }),
      onSnapshot(pantryRef, snap => {
        setPantry(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }),
    ]

    weekIds.forEach(wId => {
      unsubs.push(onSnapshot(doc(db, 'families', familyId, 'weeks', wId), snap => {
        setWeekPlans(prev => ({
          ...prev,
          [wId]: snap.exists() ? snap.data() : { days: {} },
        }))
      }))
    })

    const listRef = doc(db, 'families', familyId, 'groceryLists', 'current')
    unsubs.push(onSnapshot(listRef, snap => {
      if (snap.exists()) setListData(snap.data())
    }))

    const aisleMapRef = doc(db, 'families', familyId, 'settings', 'aisleMap')
    unsubs.push(onSnapshot(aisleMapRef, snap => {
      if (snap.exists()) setAisleMap(snap.data().mappings || {})
    }))

    return () => unsubs.forEach(u => u())
  }, [familyId, numWeeks])

  function findAisleFromMap(key) {
    return aisleMap[key] || null
  }

  function getPlannedMealNames() {
    const names = []
    Object.values(weekPlans).forEach(wp => {
      Object.values(wp.days || {}).forEach(d => {
        if (d.meal) names.push(d.meal)
      })
    })
    return [...new Set(names)]
  }

  function buildGroceryItems() {
    const mealNames = getPlannedMealNames()
    const ingredientMap = {}

    mealNames.forEach(mealName => {
      const meal = meals.find(m => m.name.toLowerCase() === mealName.toLowerCase())
      if (!meal?.ingredients) return
      meal.ingredients.forEach(ing => {
        const name = typeof ing === 'string' ? ing : ing.name
        const key = name.toLowerCase()
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            name,
            fromMeals: [],
            inPantryCollection: pantry.some(p => p.name.toLowerCase() === key && p.have),
          }
        }
        if (!ingredientMap[key].fromMeals.includes(mealName)) {
          ingredientMap[key].fromMeals.push(mealName)
        }
      })
    })

    return Object.values(ingredientMap).map(item => {
      const key = item.name.toLowerCase()
      const explicit = listData.aisles?.[key]
      const mapped = !explicit ? findAisleFromMap(key) : null
      return {
        ...item,
        checked: listData.checked?.[key] || false,
        aisle: explicit || mapped || null,
        inPantry: listData.pantryFlags?.[key] || item.inPantryCollection || false,
      }
    })
  }

  const groceryItems = buildGroceryItems()

  const grouped = groceryItems.reduce((acc, item) => {
    const a = item.aisle || 'Unassigned'
    if (!acc[a]) acc[a] = []
    acc[a].push(item)
    return acc
  }, {})

  const sortedAisles = [...aisles.filter(a => grouped[a]), ...Object.keys(grouped).filter(a => !aisles.includes(a))]

  const needCount = groceryItems.filter(i => !i.inPantry && !i.checked).length

  async function saveListData(updates) {
    const merged = { ...listData, ...updates }
    setListData(merged)
    const ref = doc(db, 'families', familyId, 'groceryLists', 'current')
    await setDoc(ref, merged, { merge: true })
  }

  function toggleChecked(itemName) {
    const key = itemName.toLowerCase()
    saveListData({ checked: { ...listData.checked, [key]: !listData.checked?.[key] } })
  }

  function togglePantry(e, itemName) {
    e.stopPropagation()
    const key = itemName.toLowerCase()
    saveListData({ pantryFlags: { ...listData.pantryFlags, [key]: !listData.pantryFlags?.[key] } })
  }

  async function setAisle(itemName, aisle) {
    const key = itemName.toLowerCase()
    saveListData({ aisles: { ...listData.aisles, [key]: aisle } })
    setEditingAisle(null)
    const newMap = { ...aisleMap, [key]: aisle }
    setAisleMap(newMap)
    const mapRef = doc(db, 'families', familyId, 'settings', 'aisleMap')
    await setDoc(mapRef, { mappings: newMap }, { merge: true })
  }

  return (
    <div className="grocery-list">
      <div className="page-header">
        <h2><ShoppingCart size={20} /> Grocery List</h2>
        <span className="badge">{needCount} needed</span>
      </div>

      <div className="grocery-weeks-toggle">
        <button
          className={`tag-chip ${numWeeks === 1 ? 'active' : ''}`}
          onClick={() => setNumWeeks(1)}
        >This week</button>
        <button
          className={`tag-chip ${numWeeks === 2 ? 'active' : ''}`}
          onClick={() => setNumWeeks(2)}
        >2 weeks</button>
      </div>

      {sortedAisles.length === 0 ? (
        <div className="empty-state">
          <p>No meals planned yet. Assign meals in the planner to build your grocery list.</p>
        </div>
      ) : (
        sortedAisles.map(aisle => (
          <div key={aisle} className="aisle-group">
            <h3 className="aisle-header">{aisle}</h3>
            {grouped[aisle].map(item => {
              const isChecked = item.checked
              const isPantry = item.inPantry
              return (
                <div
                  key={item.name}
                  className={`grocery-item ${isChecked ? 'checked' : ''} ${isPantry ? 'have' : ''}`}
                  onClick={() => toggleChecked(item.name)}
                >
                  <span className="check-circle">
                    {(isChecked || isPantry) && <Check size={14} />}
                  </span>
                  <div className="grocery-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="from-meals">{item.fromMeals.join(', ')}</span>
                  </div>
                  <button
                    className={`pantry-flag ${isPantry ? 'active' : ''}`}
                    onClick={(e) => togglePantry(e, item.name)}
                    title={isPantry ? 'Remove from pantry' : 'Mark as in pantry'}
                  >
                    <Package size={13} />
                  </button>
                  <div
                    className="aisle-picker"
                    onClick={e => e.stopPropagation()}
                    ref={editingAisle === item.name ? aislePickerRef : null}
                  >
                    <button
                      className={`aisle-tag ${!item.aisle ? 'unset' : ''}`}
                      onClick={() => setEditingAisle(editingAisle === item.name ? null : item.name)}
                    >
                      {item.aisle || 'Aisle'} <ChevronDown size={10} />
                    </button>
                    {editingAisle === item.name && (
                      <div className="aisle-dropdown">
                        {aisles.map(a => (
                          <button
                            key={a}
                            className={`aisle-option ${a === item.aisle ? 'active' : ''}`}
                            onClick={() => setAisle(item.name, a)}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
