import { useState, useEffect, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { MEMBER_COLORS, DIETARY_TAGS, CUISINE_TAGS, EMOJI_PALETTE, DEFAULT_TRUSTED_SITES, getMemberEmoji } from '../utils/constants'
import { Settings as SettingsIcon, UserPlus, LogOut, Trash2, Edit3, Check, X, Plus, Tag, Palette, Bookmark } from 'lucide-react'

const ROLE_OPTIONS = ['mom', 'dad', 'son', 'daughter', 'member']

export default function Settings() {
  const { familyId, family, currentMember, logout } = useFamily()
  const [newName, setNewName] = useState('')
  const [editingMember, setEditingMember] = useState(null)
  const [familyName, setFamilyName] = useState(family?.name || '')
  const [editingFamilyName, setEditingFamilyName] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [editingPin, setEditingPin] = useState(false)
  const [renamingMember, setRenamingMember] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [newCuisine, setNewCuisine] = useState('')
  const [emojiPickerFor, setEmojiPickerFor] = useState(null)
  const [customEmoji, setCustomEmoji] = useState('')
  const [newSite, setNewSite] = useState('')
  const pickerRef = useRef(null)

  const cuisines = family?.cuisines || CUISINE_TAGS
  const theme = family?.theme === 'midnight' ? 'midnight' : 'warm'
  const trustedSites = family?.trustedSites && family.trustedSites.length > 0
    ? family.trustedSites
    : DEFAULT_TRUSTED_SITES

  useEffect(() => {
    if (!emojiPickerFor) return
    function onDown(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setEmojiPickerFor(null)
        setCustomEmoji('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [emojiPickerFor])

  async function setTheme(nextTheme) {
    if (nextTheme === theme) return
    await updateDoc(doc(db, 'families', familyId), { theme: nextTheme })
  }

  function normalizeSite(input) {
    return String(input || '').trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
  }

  async function addTrustedSite(e) {
    e.preventDefault()
    const s = normalizeSite(newSite)
    if (!s || !s.includes('.') || trustedSites.includes(s)) return
    await updateDoc(doc(db, 'families', familyId), { trustedSites: [...trustedSites, s] })
    setNewSite('')
  }

  async function removeTrustedSite(site) {
    await updateDoc(doc(db, 'families', familyId), {
      trustedSites: trustedSites.filter(s => s !== site)
    })
  }

  async function setMemberEmoji(memberName, emoji) {
    const updated = family.members.map(m =>
      m.name === memberName ? { ...m, emoji } : m
    )
    await updateDoc(doc(db, 'families', familyId), { members: updated })
    setEmojiPickerFor(null)
    setCustomEmoji('')
  }

  async function addCuisine(e) {
    e.preventDefault()
    const v = newCuisine.trim()
    if (!v || cuisines.includes(v)) return
    await updateDoc(doc(db, 'families', familyId), { cuisines: [...cuisines, v] })
    setNewCuisine('')
  }

  async function removeCuisine(tag) {
    await updateDoc(doc(db, 'families', familyId), { cuisines: cuisines.filter(c => c !== tag) })
  }

  async function addMember(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const updated = [...family.members, { name: newName.trim(), role: 'member' }]
    await updateDoc(doc(db, 'families', familyId), { members: updated })
    setNewName('')
  }

  async function removeMember(memberName) {
    if (memberName === currentMember.name) return
    if (!confirm(`Remove ${memberName} from the family?`)) return
    const updated = family.members.filter(m => m.name !== memberName)
    await updateDoc(doc(db, 'families', familyId), { members: updated })
  }

  async function saveFamilyName() {
    if (!familyName.trim()) return
    await updateDoc(doc(db, 'families', familyId), { name: familyName.trim() })
    setEditingFamilyName(false)
  }

  async function savePin() {
    if (newPin.length !== 4) return
    await updateDoc(doc(db, 'families', familyId), { pin: newPin })
    setEditingPin(false)
    setNewPin('')
  }

  async function updateMemberRole(memberName, role) {
    const updated = family.members.map(m =>
      m.name === memberName ? { ...m, role } : m
    )
    await updateDoc(doc(db, 'families', familyId), { members: updated })
  }

  async function renameMember(oldName, newMemberName) {
    if (!newMemberName.trim() || newMemberName.trim() === oldName) {
      setRenamingMember(null)
      return
    }
    const updated = family.members.map(m =>
      m.name === oldName ? { ...m, name: newMemberName.trim() } : m
    )
    await updateDoc(doc(db, 'families', familyId), { members: updated })
    setRenamingMember(null)
  }

  async function updateMemberPrefs(memberName, prefs) {
    const updated = family.members.map(m =>
      m.name === memberName ? { ...m, ...prefs } : m
    )
    await updateDoc(doc(db, 'families', familyId), { members: updated })
    setEditingMember(null)
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2><SettingsIcon size={20} /> Family Settings</h2>
      </div>

      <section className="settings-section">
        <h3><Palette size={14} /> Appearance</h3>
        <p className="settings-hint">Pick a look for the whole family.</p>
        <div className="theme-toggle">
          <button
            className={theme === 'warm' ? 'active' : ''}
            onClick={() => setTheme('warm')}
            type="button"
          >☀️ Warm</button>
          <button
            className={theme === 'midnight' ? 'active' : ''}
            onClick={() => setTheme('midnight')}
            type="button"
          >🌙 Midnight</button>
        </div>
      </section>

      <section className="settings-section">
        <h3>Family Name</h3>
        {editingFamilyName ? (
          <div className="inline-form">
            <input
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && saveFamilyName()}
            />
            <button onClick={saveFamilyName} className="btn-icon" style={{ color: 'var(--success)' }}>
              <Check size={18} />
            </button>
            <button onClick={() => { setFamilyName(family?.name || ''); setEditingFamilyName(false) }} className="btn-icon">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="inline-form">
            <span className="settings-value">{family?.name || 'Unnamed Family'}</span>
            <button onClick={() => setEditingFamilyName(true)} className="btn-icon">
              <Edit3 size={16} />
            </button>
          </div>
        )}
      </section>

      <section className="settings-section">
        <h3>Family PIN</h3>
        {editingPin ? (
          <div className="inline-form">
            <input
              type="tel"
              maxLength={4}
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New 4-digit PIN"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && savePin()}
            />
            <button onClick={savePin} className="btn-icon" style={{ color: 'var(--success)' }} disabled={newPin.length !== 4}>
              <Check size={18} />
            </button>
            <button onClick={() => { setEditingPin(false); setNewPin('') }} className="btn-icon">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="inline-form">
            <span className="settings-value">{family?.pin}</span>
            <button onClick={() => setEditingPin(true)} className="btn-icon">
              <Edit3 size={16} />
            </button>
          </div>
        )}
      </section>

      <section className="settings-section">
        <h3>Members</h3>
        <div className="members-list">
          {family?.members.map(m => (
            <div key={m.name} className="member-row">
              <div
                className="emoji-picker-wrap"
                ref={emojiPickerFor === m.name ? pickerRef : null}
                style={{ '--member-color': MEMBER_COLORS[m.name] || 'var(--border)' }}
              >
                <button
                  type="button"
                  className="emoji-picker-trigger"
                  onClick={() => setEmojiPickerFor(emojiPickerFor === m.name ? null : m.name)}
                  title="Change emoji"
                >
                  {getMemberEmoji(m)}
                </button>
                {emojiPickerFor === m.name && (
                  <div className="emoji-picker-popover">
                    <div className="emoji-grid">
                      {EMOJI_PALETTE.map(e => (
                        <button
                          key={e}
                          type="button"
                          className={getMemberEmoji(m) === e ? 'active' : ''}
                          onClick={() => setMemberEmoji(m.name, e)}
                        >{e}</button>
                      ))}
                    </div>
                    <div className="emoji-picker-custom">
                      <input
                        value={customEmoji}
                        onChange={e => setCustomEmoji(e.target.value)}
                        placeholder="Or paste any emoji"
                        maxLength={4}
                      />
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        disabled={!customEmoji.trim()}
                        onClick={() => setMemberEmoji(m.name, customEmoji.trim())}
                      ><Check size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
              {renamingMember === m.name ? (
                <div className="inline-form" style={{ flex: 1 }}>
                  <input
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && renameMember(m.name, renameValue)}
                    style={{ padding: '4px 8px', fontSize: '13px' }}
                  />
                  <button onClick={() => renameMember(m.name, renameValue)} className="btn-icon" style={{ color: 'var(--success)' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => setRenamingMember(null)} className="btn-icon">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="member-row-name"
                    onClick={() => { setRenamingMember(m.name); setRenameValue(m.name) }}
                    style={{ cursor: 'pointer' }}
                    title="Click to rename"
                  >
                    {m.name}
                  </span>
                  {m.name === currentMember.name && <span className="you-badge">you</span>}
                  <select
                    className="role-select"
                    value={m.role || 'member'}
                    onChange={e => updateMemberRole(m.name, e.target.value)}
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    onClick={() => setEditingMember(editingMember === m.name ? null : m.name)}
                    className="btn-icon"
                    title="Dietary preferences"
                  >
                    ⚙
                  </button>
                  {m.name !== currentMember.name && (
                    <button onClick={() => removeMember(m.name)} className="btn-icon btn-danger">
                      <Trash2 size={14} />
                    </button>
                  )}
                </>
              )}
              {editingMember === m.name && (
                <div className="member-prefs">
                  <p>Dietary Preferences:</p>
                  <div className="checkbox-group">
                    {DIETARY_TAGS.map(tag => (
                      <label key={tag} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={m.dietary?.includes(tag) || false}
                          onChange={e => {
                            const dietary = e.target.checked
                              ? [...(m.dietary || []), tag]
                              : (m.dietary || []).filter(t => t !== tag)
                            updateMemberPrefs(m.name, { dietary })
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addMember} className="inline-form">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Add family member..."
          />
          <button type="submit" className="btn-primary btn-sm">
            <UserPlus size={16} />
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h3><Tag size={16} /> Meal Tags</h3>
        <p className="settings-hint">Used as cuisine/category tags on meals (Italian, Mexican, Comfort Food, etc.)</p>
        <div className="tag-edit-list">
          {cuisines.map(c => (
            <span key={c} className="tag-chip removable">
              {c}
              <button onClick={() => removeCuisine(c)} className="tag-remove" title="Remove">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={addCuisine} className="inline-form">
          <input
            value={newCuisine}
            onChange={e => setNewCuisine(e.target.value)}
            placeholder="Add tag..."
          />
          <button type="submit" className="btn-primary btn-sm" disabled={!newCuisine.trim()}>
            <Plus size={16} />
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h3><Bookmark size={14} /> Favorite Recipe Sites</h3>
        <p className="settings-hint">Sites we'll search in the Meals tab and link to as shortcuts. WordPress recipe blogs work best.</p>
        <div className="tag-edit-list">
          {trustedSites.map(s => (
            <span key={s} className="tag-chip removable">
              {s}
              <button onClick={() => removeTrustedSite(s)} className="tag-remove" title="Remove">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={addTrustedSite} className="inline-form">
          <input
            value={newSite}
            onChange={e => setNewSite(e.target.value)}
            placeholder="e.g. smittenkitchen.com"
          />
          <button type="submit" className="btn-primary btn-sm" disabled={!newSite.trim()}>
            <Plus size={16} />
          </button>
        </form>
      </section>

      <section className="settings-section">
        <button onClick={logout} className="btn-secondary btn-logout">
          <LogOut size={16} /> Switch User / Logout
        </button>
      </section>
    </div>
  )
}
