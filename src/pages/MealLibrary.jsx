import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase/config'
import { useFamily } from '../context/FamilyContext'
import { CUISINE_TAGS as DEFAULT_CUISINES, DIETARY_TAGS, DEFAULT_TRUSTED_SITES } from '../utils/constants'
import { getWeekId, getWeekDays, formatWeekRange } from '../utils/dates'
import { SEED_MEALS } from '../data/seedMeals'
import { Search, Plus, X, Star, Clock, Users, ChevronDown, ChevronUp, Calendar, Link2, Download, ExternalLink, CheckCircle2, User, Bookmark, Globe, ThumbsUp, ThumbsDown } from 'lucide-react'

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
}

function getMealSourceUrl(meal) {
  if (meal.sourceUrl) return meal.sourceUrl
  if (meal.notes && /^https?:\/\//i.test(meal.notes.trim())) return meal.notes.trim()
  return null
}

const CUISINE_EMOJI = {
  American: '🍔', Italian: '🍝', Mexican: '🌮', Asian: '🥡',
  Indian: '🍛', Mediterranean: '🫒', 'Comfort Food': '🍲',
  'BBQ/Grill': '🔥', 'Soup/Stew': '🥣', Pasta: '🍝', Seafood: '🐟',
}

export default function MealLibrary() {
  const { familyId, currentMember, family } = useFamily()
  const CUISINE_TAGS = family?.cuisines || DEFAULT_CUISINES
  const [meals, setMeals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [expandedMeals, setExpandedMeals] = useState(new Set())
  const [weekFilter, setWeekFilter] = useState(false)
  const [weekPlan, setWeekPlan] = useState(null)
  const [importMode, setImportMode] = useState('search')
  const [showMealSearch, setShowMealSearch] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [spoonOffset, setSpoonOffset] = useState(0)
  const [spoonTotal, setSpoonTotal] = useState(0)
  const [sitesStatus, setSitesStatus] = useState([])
  const trustedSites = family?.trustedSites && family.trustedSites.length > 0
    ? family.trustedSites
    : DEFAULT_TRUSTED_SITES
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [toast, setToast] = useState(null)
  const [sourceFilter, setSourceFilter] = useState('all')
  const [addedByFilter, setAddedByFilter] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [lovedOnly, setLovedOnly] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name: '',
    cuisine: '',
    cookTime: '',
    servings: '',
    dietary: [],
    ingredients: '',
    notes: '',
  })

  const currentWeekId = getWeekId(new Date())

  useEffect(() => {
    if (!familyId) return
    const ref = collection(db, 'families', familyId, 'meals')
    const unsub = onSnapshot(ref, (snap) => {
      setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [familyId])

  useEffect(() => {
    if (!familyId) return
    const ref = doc(db, 'families', familyId, 'weeks', currentWeekId)
    const unsub = onSnapshot(ref, snap => {
      setWeekPlan(snap.exists() ? snap.data() : { days: {} })
    })
    return unsub
  }, [familyId, currentWeekId])

  async function handleAddMeal(e) {
    e.preventDefault()
    const ingredients = newMeal.ingredients
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    await addDoc(collection(db, 'families', familyId, 'meals'), {
      name: newMeal.name,
      cuisine: newMeal.cuisine || null,
      cookTime: newMeal.cookTime ? parseInt(newMeal.cookTime) : null,
      servings: newMeal.servings ? parseInt(newMeal.servings) : null,
      dietary: newMeal.dietary,
      ingredients,
      notes: newMeal.notes || null,
      source: 'manual',
      addedBy: currentMember.name,
      favorite: false,
      timesCooked: 0,
      createdAt: new Date().toISOString(),
    })

    showToast(`Added "${newMeal.name}" to library`)
    setNewMeal({ name: '', cuisine: '', cookTime: '', servings: '', dietary: [], ingredients: '', notes: '' })
    setShowAdd(false)
  }

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  async function saveImportedRecipe(recipe, source) {
    await addDoc(collection(db, 'families', familyId, 'meals'), {
      name: recipe.name || 'Untitled',
      cuisine: recipe.cuisine || null,
      cookTime: recipe.cookTime || null,
      servings: recipe.servings || null,
      dietary: [],
      ingredients: recipe.ingredients || [],
      notes: recipe.sourceUrl || null,
      image: recipe.image || null,
      instructions: recipe.instructions || null,
      sourceUrl: recipe.sourceUrl || null,
      source,
      addedBy: currentMember.name,
      favorite: false,
      timesCooked: 0,
      createdAt: new Date().toISOString(),
    })
    showToast(`Added "${recipe.name || 'recipe'}" to library`)
  }

  async function handleUrlImport() {
    if (!importUrl.trim()) return
    setImporting(true); setImportError(null)
    try {
      const fn = httpsCallable(functions, 'importRecipeFromUrl')
      const { data } = await fn({ url: importUrl.trim() })
      await saveImportedRecipe(data, 'url')
      setImportUrl('')
    } catch (e) {
      const code = e?.code || ''
      const serverMsg = e?.message || ''
      let friendly
      if (code.endsWith('failed-precondition')) {
        friendly = serverMsg
          ? `${serverMsg.replace(/\.$/, '')} — you may need to add this one manually.`
          : 'Remote site is not allowing import — you may need to add this one manually.'
      } else if (code.endsWith('not-found')) {
        friendly = serverMsg || "Couldn't find a recipe on that page. Check the URL or add it manually."
      } else if (code.endsWith('resource-exhausted')) {
        friendly = serverMsg || 'That site is rate-limiting us. Try again in a minute, or add manually.'
      } else if (code.endsWith('unavailable')) {
        friendly = serverMsg || "Couldn't reach the recipe page. Check the URL or try again."
      } else {
        friendly = serverMsg || 'Import failed'
      }
      setImportError(friendly)
    } finally {
      setImporting(false)
    }
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
  }

  async function handleSearch(append = false) {
    if (!query.trim()) return
    setImporting(true); setImportError(null)
    if (!append) {
      setResults([])
      setSpoonOffset(0)
      setSpoonTotal(0)
      setSitesStatus([])
    }

    const offset = append ? spoonOffset : 0

    try {
      const spoonFn = httpsCallable(functions, 'searchRecipes')
      const spoonTask = spoonFn({ query: query.trim(), offset })
        .catch(err => ({ data: { results: [], totalResults: 0, _error: err?.message } }))

      const sitesTask = (!append && trustedSites.length > 0)
        ? httpsCallable(functions, 'searchTrustedSites')({ query: query.trim(), sites: trustedSites })
            .catch(err => ({ data: { results: [], sites: [], _error: err?.message } }))
        : Promise.resolve(null)

      const [spoonRes, sitesRes] = await Promise.all([spoonTask, sitesTask])

      const spoonNormalized = (spoonRes.data.results || []).map(r => ({
        kind: 'spoon',
        key: `s-${r.id}`,
        name: r.name,
        image: r.image,
        sourceUrl: r.sourceUrl,
        host: r.sourceUrl ? hostOf(r.sourceUrl) : null,
        cookTime: r.cookTime,
        servings: r.servings,
        _raw: r,
      }))

      const sitesNormalized = sitesRes
        ? (sitesRes.data.results || []).map(r => ({
            kind: 'site',
            key: `t-${r.url}`,
            name: r.title,
            image: r.image,
            sourceUrl: r.url,
            host: r.host,
            cookTime: null,
            servings: null,
            _raw: r,
          }))
        : []

      const siteUrls = new Set(sitesNormalized.map(r => r.sourceUrl))
      const spoonDeduped = spoonNormalized.filter(r => !r.sourceUrl || !siteUrls.has(r.sourceUrl))

      if (append) {
        setResults(prev => [...prev, ...spoonDeduped])
      } else {
        setResults([...sitesNormalized, ...spoonDeduped])
        setSitesStatus(sitesRes?.data?.sites || [])
      }
      setSpoonTotal(spoonRes.data.totalResults || 0)
      setSpoonOffset(offset + spoonNormalized.length)
    } catch (e) {
      setImportError(e?.message || 'Search failed')
    } finally {
      setImporting(false)
    }
  }

  async function handleImportResult(r) {
    setImporting(true); setImportError(null)
    try {
      if (r.kind === 'spoon') {
        const detailsFn = httpsCallable(functions, 'getRecipeDetails')
        const { data } = await detailsFn({ id: r._raw.id })
        await saveImportedRecipe({ ...r._raw, ...data }, 'spoonacular')
      } else {
        const importFn = httpsCallable(functions, 'importRecipeFromUrl')
        const { data } = await importFn({ url: r.sourceUrl })
        await saveImportedRecipe(
          { ...data, image: data.image || r.image, name: data.name || r.name },
          'url'
        )
      }
      setResults(prev => prev.filter(x => x.key !== r.key))
    } catch (e) {
      const code = e?.code || ''
      const serverMsg = e?.message || ''
      let friendly
      if (code.endsWith('failed-precondition')) {
        friendly = serverMsg
          ? `${serverMsg.replace(/\.$/, '')} — you may need to add this one manually.`
          : 'Remote site is not allowing import — you may need to add this one manually.'
      } else if (code.endsWith('not-found')) {
        friendly = serverMsg || "Couldn't find a recipe on that page. Check the URL or add it manually."
      } else if (code.endsWith('resource-exhausted')) {
        friendly = serverMsg || 'That site is rate-limiting us. Try again in a minute.'
      } else {
        friendly = serverMsg || 'Import failed'
      }
      setImportError(friendly)
    } finally {
      setImporting(false)
    }
  }

  async function cleanupSeedMeals() {
    const seedNames = new Set(SEED_MEALS.map(m => m.name.toLowerCase()))
    const toDelete = meals.filter(m =>
      m.source === 'seed' || (seedNames.has(m.name.toLowerCase()) && !m.sourceUrl && !m.instructions)
    )
    if (toDelete.length === 0) return
    if (!confirm(`Delete ${toDelete.length} seed meals (no recipes attached)?`)) return
    for (const m of toDelete) {
      await deleteDoc(doc(db, 'families', familyId, 'meals', m.id))
    }
    showToast(`Removed ${toDelete.length} meals`)
  }

  async function toggleFavorite(e, meal) {
    e.stopPropagation()
    await updateDoc(doc(db, 'families', familyId, 'meals', meal.id), {
      favorite: !meal.favorite,
    })
  }

  async function setRating(e, meal, vote) {
    e.stopPropagation()
    const ratings = { ...(meal.ratings || {}) }
    const me = currentMember.name
    if (ratings[me] === vote) delete ratings[me]
    else ratings[me] = vote
    await updateDoc(doc(db, 'families', familyId, 'meals', meal.id), { ratings })
  }

  function tallyRatings(meal) {
    const r = meal.ratings || {}
    const up = []
    const down = []
    for (const [name, vote] of Object.entries(r)) {
      if (vote === 'up') up.push(name)
      else if (vote === 'down') down.push(name)
    }
    return { up, down, mine: r[currentMember.name] || null }
  }

  async function deleteMeal(e, mealId) {
    e.stopPropagation()
    if (confirm('Remove this meal from the library?')) {
      await deleteDoc(doc(db, 'families', familyId, 'meals', mealId))
    }
  }

  const plannedMealNames = weekPlan
    ? [...new Set(Object.values(weekPlan.days || {}).map(d => d.meal).filter(Boolean))]
    : []

  function netVotes(m) {
    const r = m.ratings || {}
    let n = 0
    for (const v of Object.values(r)) {
      if (v === 'up') n++
      else if (v === 'down') n--
    }
    return n
  }
  function upCount(m) {
    const r = m.ratings || {}
    let n = 0
    for (const v of Object.values(r)) if (v === 'up') n++
    return n
  }

  const filtered = meals.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !filterTag || m.cuisine === filterTag || m.dietary?.includes(filterTag)
    const matchesWeek = !weekFilter || plannedMealNames.some(n => n.toLowerCase() === m.name.toLowerCase())
    const matchesSource = sourceFilter === 'all'
      || (sourceFilter === 'imported' && (m.source === 'url' || m.source === 'spoonacular'))
      || (sourceFilter === 'added' && (m.source === 'manual' || m.source === 'seed' || !m.source))
    const matchesAddedBy = !addedByFilter || m.addedBy === addedByFilter
    const matchesFavorite = !favoritesOnly || m.favorite
    const matchesLoved = !lovedOnly || upCount(m) > 0
    return matchesSearch && matchesTag && matchesWeek && matchesSource && matchesAddedBy && matchesFavorite && matchesLoved
  })

  const favoriteCount = meals.filter(m => m.favorite).length
  const lovedCount = meals.filter(m => upCount(m) > 0).length

  const addedByList = [...new Set(meals.map(m => m.addedBy).filter(Boolean))].sort()
  const importedCount = meals.filter(m => m.source === 'url' || m.source === 'spoonacular').length
  const addedCount = meals.length - importedCount

  const sorted = [...filtered].sort((a, b) => {
    if (lovedOnly) {
      const d = netVotes(b) - netVotes(a)
      if (d !== 0) return d
    }
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="meal-library">
      <div className="page-header">
        <h2>Meal Library</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(() => {
            const seedNames = new Set(SEED_MEALS.map(m => m.name.toLowerCase()))
            const seedCount = meals.filter(m =>
              m.source === 'seed' || (seedNames.has(m.name.toLowerCase()) && !m.sourceUrl && !m.instructions)
            ).length
            if (seedCount === 0) return null
            return (
              <button onClick={cleanupSeedMeals} className="btn-secondary btn-sm">
                <X size={16} /> Remove {seedCount} seed
              </button>
            )
          })()}
        </div>
      </div>

      <div className="import-inline">
        {trustedSites.length > 0 && (
          <div className="trusted-sites-row" title="Favorite recipe sites">
            <span className="trusted-sites-label"><Bookmark size={12} /> Favorite Sites:</span>
            {trustedSites.map(site => (
              <a
                key={site}
                href={`https://${site}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="trusted-site-chip"
                title={`Open ${site} in a new tab`}
              >
                <Globe size={11} /> {site}
              </a>
            ))}
          </div>
        )}
        <div className="import-inline-tabs">
          <button
            className={`import-tab ${importMode === 'search' ? 'active' : ''}`}
            onClick={() => setImportMode('search')}
          ><Search size={14} /> Search / Add</button>
          <button
            className={`import-tab ${importMode === 'url' ? 'active' : ''}`}
            onClick={() => setImportMode('url')}
          ><Link2 size={14} /> Paste URL</button>
          <button
            className="import-tab"
            onClick={() => setShowAdd(true)}
            title="Add a meal by typing it in"
          ><Plus size={14} /> Add manually</button>
        </div>
        {importMode === 'search' && (
          <>
            <div className="import-inline-row">
              <div className="import-inline-input-wrap">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. beef stew, vegetarian pasta"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                {query && (
                  <button
                    type="button"
                    className="import-inline-clear"
                    onClick={() => {
                      setQuery('')
                      setResults([])
                      setSpoonOffset(0)
                      setSpoonTotal(0)
                      setSitesStatus([])
                      setImportError(null)
                    }}
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSearch()}
                disabled={importing || !query.trim()}
              >{importing && results.length === 0 ? '...' : 'Search'}</button>
            </div>
            {sitesStatus.length > 0 && (
              <div className="sites-search-status">
                {sitesStatus.map(s => (
                  <span key={s.host} className={`sites-status-chip ${s.error ? 'err' : ''}`}>
                    {s.error ? `${s.host}: ${s.error}` : `${s.host}: ${s.count}`}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        {importMode === 'url' && (
          <div className="import-inline-row">
            <input
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="https://www.allrecipes.com/recipe/..."
              onKeyDown={e => e.key === 'Enter' && handleUrlImport()}
            />
            <button
              className="btn-primary"
              onClick={handleUrlImport}
              disabled={importing || !importUrl.trim()}
            >{importing ? 'Importing...' : 'Import'}</button>
          </div>
        )}
        {importError && <p className="import-error">{importError}</p>}
        {importMode === 'search' && results.length > 0 && (() => {
          const spoonLoaded = results.filter(r => r.kind === 'spoon').length
          const hasMore = spoonTotal > 0 && spoonLoaded < spoonTotal
          return (
            <div className="import-results">
              {results.map(r => (
                <div key={r.key} className="import-result">
                  {r.image && (
                    <img
                      src={r.image}
                      alt=""
                      className="import-result-img"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div className="import-result-info">
                    {r.sourceUrl ? (
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="import-result-name import-result-link">
                        {r.name} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="import-result-name">{r.name}</span>
                    )}
                    <div className="meal-meta">
                      {r.host && <span className="meta-badge source-badge">{r.host}</span>}
                      {r.cookTime && <span className="meta-badge"><Clock size={12} /> {r.cookTime}m</span>}
                      {r.servings && <span className="meta-badge"><Users size={12} /> {r.servings}</span>}
                    </div>
                  </div>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleImportResult(r)}
                    disabled={importing}
                    title="Add to library"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
              <div className="import-results-footer">
                <span className="import-results-count">
                  {results.length} result{results.length === 1 ? '' : 's'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {hasMore && (
                    <button className="btn-secondary btn-sm" onClick={() => handleSearch(true)} disabled={importing}>
                      {importing ? 'Loading...' : 'Load more'}
                    </button>
                  )}
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      setResults([]); setSpoonOffset(0); setSpoonTotal(0); setSitesStatus([])
                    }}
                  >Clear</button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <div className="tag-filters">
        <button
          className={`tag-chip ${!filterTag && !weekFilter && !favoritesOnly && !lovedOnly ? 'active' : ''}`}
          onClick={() => { setFilterTag(''); setWeekFilter(false); setFavoritesOnly(false); setLovedOnly(false) }}
        >
          All ({meals.length})
        </button>
        <button
          className={`tag-chip ${favoritesOnly ? 'active' : ''}`}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Star size={12} fill={favoritesOnly ? '#f59e0b' : 'none'} color="#f59e0b" /> Favorites ({favoriteCount})
        </button>
        {lovedCount > 0 && (
          <button
            className={`tag-chip ${lovedOnly ? 'active' : ''}`}
            onClick={() => setLovedOnly(!lovedOnly)}
            title="Sort by net thumbs-up across the family"
          >
            <ThumbsUp size={12} /> Most Loved ({lovedCount})
          </button>
        )}
        {plannedMealNames.length > 0 && (
          <button
            className={`tag-chip ${weekFilter ? 'active' : ''}`}
            onClick={() => setWeekFilter(!weekFilter)}
          >
            <Calendar size={12} /> This Week ({plannedMealNames.length})
          </button>
        )}
        {CUISINE_TAGS.map(tag => {
          const count = meals.filter(m => m.cuisine === tag).length
          if (count === 0) return null
          return (
            <button
              key={tag}
              className={`tag-chip ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
            >
              {tag} ({count})
            </button>
          )
        })}
      </div>

      <div className="tag-filters">
        <button
          className={`tag-chip ${sourceFilter === 'imported' ? 'active' : ''}`}
          onClick={() => setSourceFilter(sourceFilter === 'imported' ? 'all' : 'imported')}
        ><Download size={12} /> Imported ({importedCount})</button>
        <button
          className={`tag-chip ${sourceFilter === 'added' ? 'active' : ''}`}
          onClick={() => setSourceFilter(sourceFilter === 'added' ? 'all' : 'added')}
        ><Plus size={12} /> Added ({addedCount})</button>
        {addedByList.map(name => (
          <button
            key={name}
            className={`tag-chip ${addedByFilter === name ? 'active' : ''}`}
            onClick={() => setAddedByFilter(addedByFilter === name ? '' : name)}
          ><User size={12} /> {name}</button>
        ))}
        <button
          onClick={() => setShowMealSearch(!showMealSearch)}
          className={`tag-chip ${showMealSearch ? 'active' : ''}`}
          title="Filter library by name"
        ><Search size={12} /></button>
      </div>

      {showMealSearch && (
        <div className="search-bar compact">
          <Search size={14} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter library..."
            autoFocus
          />
          {searchTerm && (
            <button className="btn-icon search-clear" onClick={() => setSearchTerm('')}>
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 && meals.length === 0 && (
        <div className="empty-state">
          <p>No meals yet. Tap "Seed Library" to add 80+ family dinners, or add your own!</p>
        </div>
      )}

      <div className="meal-grid">
        {sorted.map(meal => {
          const isExpanded = expandedMeals.has(meal.id)
          const emoji = CUISINE_EMOJI[meal.cuisine] || '🍽️'
          const rating = tallyRatings(meal)
          return (
            <div
              key={meal.id}
              className={`meal-card-v2 ${isExpanded ? 'expanded' : ''}`}
              onClick={() => {
                setExpandedMeals(prev => {
                  const next = new Set(prev)
                  if (next.has(meal.id)) next.delete(meal.id)
                  else next.add(meal.id)
                  return next
                })
              }}
            >
              <div className="meal-card-top">
                {meal.image ? (
                  <img
                    src={meal.image}
                    alt=""
                    className="meal-thumb"
                    loading="lazy"
                    onError={(e) => {
                      const fallback = document.createElement('span')
                      fallback.className = 'meal-emoji'
                      fallback.textContent = emoji
                      e.currentTarget.replaceWith(fallback)
                    }}
                  />
                ) : (
                  <span className="meal-emoji">{emoji}</span>
                )}
                <div className="meal-card-info">
                  <span className="meal-card-name">{meal.name}</span>
                  <div className="meal-meta">
                    {meal.cookTime && (
                      <span className="meta-badge"><Clock size={12} /> {meal.cookTime}m</span>
                    )}
                    {meal.servings && (
                      <span className="meta-badge"><Users size={12} /> {meal.servings}</span>
                    )}
                    {meal.ingredients?.length > 0 && (
                      <span className="meta-badge">{meal.ingredients.length} items</span>
                    )}
                    {rating.up.length > 0 && (
                      <span className="meta-badge rating-up-badge" title={rating.up.join(', ')}>
                        <ThumbsUp size={11} /> {rating.up.length}
                      </span>
                    )}
                    {rating.down.length > 0 && (
                      <span className="meta-badge rating-down-badge" title={rating.down.join(', ')}>
                        <ThumbsDown size={11} /> {rating.down.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="meal-card-actions">
                  {(() => {
                    const src = getMealSourceUrl(meal)
                    return src ? (
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon"
                        onClick={e => e.stopPropagation()}
                        title={getDomain(src) || 'View source'}
                      >
                        <ExternalLink size={15} />
                      </a>
                    ) : null
                  })()}
                  <button onClick={(e) => toggleFavorite(e, meal)} className="btn-icon">
                    <Star size={16} fill={meal.favorite ? '#f59e0b' : 'none'} color="#f59e0b" />
                  </button>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isExpanded && (
                <div className="meal-card-expanded">
                  <div className="meal-ratings">
                    <div className="your-rating">
                      <span className="rating-label">Your rating:</span>
                      <button
                        type="button"
                        className={`rating-btn up${rating.mine === 'up' ? ' active' : ''}`}
                        onClick={(e) => setRating(e, meal, 'up')}
                        title="Thumbs up"
                        aria-label="Thumbs up"
                      ><ThumbsUp size={14} /></button>
                      <button
                        type="button"
                        className={`rating-btn down${rating.mine === 'down' ? ' active' : ''}`}
                        onClick={(e) => setRating(e, meal, 'down')}
                        title="Thumbs down"
                        aria-label="Thumbs down"
                      ><ThumbsDown size={14} /></button>
                    </div>
                    {(() => {
                      const others = [...rating.up, ...rating.down].filter(n => n !== currentMember.name)
                      if (others.length === 0) return null
                      return (
                        <div className="other-ratings">
                          {rating.up.filter(n => n !== currentMember.name).map(n => (
                            <span key={`u-${n}`} className="other-rating up">
                              {n} <ThumbsUp size={11} />
                            </span>
                          ))}
                          {rating.down.filter(n => n !== currentMember.name).map(n => (
                            <span key={`d-${n}`} className="other-rating down">
                              {n} <ThumbsDown size={11} />
                            </span>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                  {meal.cuisine && <span className="cuisine-badge">{meal.cuisine}</span>}
                  {meal.dietary?.map(d => (
                    <span key={d} className="dietary-badge">{d}</span>
                  ))}
                  {meal.ingredients?.length > 0 && (
                    <div className="ingredient-list">
                      <strong>Ingredients:</strong>
                      <ul>
                        {(Array.isArray(meal.ingredients) ? meal.ingredients : []).map((ing, i) => (
                          <li key={i}>{typeof ing === 'string' ? ing : ing.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(() => {
                    const src = getMealSourceUrl(meal)
                    return (
                      <>
                        {meal.notes && meal.notes !== src && <p className="meal-notes">{meal.notes}</p>}
                        {src && (
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meal-source-link"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={12} /> {getDomain(src) || 'View source'}
                          </a>
                        )}
                      </>
                    )
                  })()}
                  <div className="meal-card-footer">
                    <span className="added-by">Added by {meal.addedBy}</span>
                    <button onClick={(e) => deleteMeal(e, meal.id)} className="btn-icon btn-danger">
                      <X size={14} /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add a Meal</h3>
            <form onSubmit={handleAddMeal}>
              <label>
                Meal Name *
                <input
                  value={newMeal.name}
                  onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                  required
                  placeholder="e.g. Beef Stroganoff"
                />
              </label>
              <div className="form-row">
                <label>
                  Cuisine
                  <select
                    value={newMeal.cuisine}
                    onChange={e => setNewMeal({ ...newMeal, cuisine: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {CUISINE_TAGS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  Cook Time (min)
                  <input
                    type="number"
                    value={newMeal.cookTime}
                    onChange={e => setNewMeal({ ...newMeal, cookTime: e.target.value })}
                    placeholder="30"
                    min="1"
                  />
                </label>
                <label>
                  Servings
                  <input
                    type="number"
                    value={newMeal.servings}
                    onChange={e => setNewMeal({ ...newMeal, servings: e.target.value })}
                    placeholder="4"
                    min="1"
                  />
                </label>
              </div>
              <label>
                Ingredients (one per line)
                <textarea
                  value={newMeal.ingredients}
                  onChange={e => setNewMeal({ ...newMeal, ingredients: e.target.value })}
                  rows={4}
                  placeholder="1 lb ground beef&#10;2 cups rice&#10;1 can coconut milk"
                />
              </label>
              <label>
                Notes
                <input
                  value={newMeal.notes}
                  onChange={e => setNewMeal({ ...newMeal, notes: e.target.value })}
                  placeholder="Family favorite, kids love it"
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  )
}
