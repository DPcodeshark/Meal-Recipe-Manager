import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { AISLE_ORDER } from '../utils/constants'
import { Plus, Trash2, Package } from 'lucide-react'

export default function Pantry() {
  const { familyId } = useFamily()
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [newAisle, setNewAisle] = useState('Other')
  const [filter, setFilter] = useState('all') // all | have | need

  useEffect(() => {
    if (!familyId) return
    const ref = collection(db, 'families', familyId, 'pantry')
    const unsub = onSnapshot(ref, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [familyId])

  async function addItem(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    await addDoc(collection(db, 'families', familyId, 'pantry'), {
      name: newItem.trim(),
      aisle: newAisle,
      have: true,
      addedAt: new Date().toISOString(),
    })
    setNewItem('')
  }

  async function toggleHave(item) {
    await updateDoc(doc(db, 'families', familyId, 'pantry', item.id), {
      have: !item.have,
    })
  }

  async function removeItem(itemId) {
    await deleteDoc(doc(db, 'families', familyId, 'pantry', itemId))
  }

  const filtered = items.filter(i => {
    if (filter === 'have') return i.have
    if (filter === 'need') return !i.have
    return true
  })

  const grouped = filtered.reduce((acc, item) => {
    const aisle = item.aisle || 'Other'
    if (!acc[aisle]) acc[aisle] = []
    acc[aisle].push(item)
    return acc
  }, {})

  return (
    <div className="pantry-page">
      <div className="page-header">
        <h2><Package size={20} /> Pantry</h2>
      </div>

      <form onSubmit={addItem} className="pantry-add-form">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Add item..."
        />
        <select value={newAisle} onChange={e => setNewAisle(e.target.value)}>
          {AISLE_ORDER.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button type="submit" className="btn-primary btn-sm"><Plus size={16} /></button>
      </form>

      <div className="filter-tabs">
        {['all', 'have', 'need'].map(f => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'have' ? 'Have' : 'Need'}
            <span className="tab-count">
              {f === 'all' ? items.length : items.filter(i => f === 'have' ? i.have : !i.have).length}
            </span>
          </button>
        ))}
      </div>

      {Object.entries(grouped)
        .sort(([a], [b]) => {
          const aIdx = AISLE_ORDER.indexOf(a)
          const bIdx = AISLE_ORDER.indexOf(b)
          return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
        })
        .map(([aisle, aisleItems]) => (
          <div key={aisle} className="aisle-group">
            <h3 className="aisle-header">{aisle}</h3>
            {aisleItems.map(item => (
              <div key={item.id} className={`pantry-item ${item.have ? 'have' : 'need'}`}>
                <button
                  className={`status-toggle ${item.have ? 'have' : 'need'}`}
                  onClick={() => toggleHave(item)}
                >
                  {item.have ? '✓' : '○'}
                </button>
                <span className="item-name">{item.name}</span>
                <button onClick={() => removeItem(item.id)} className="btn-icon btn-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ))}

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No items in your pantry yet. Add items you have on hand.</p>
        </div>
      )}
    </div>
  )
}
