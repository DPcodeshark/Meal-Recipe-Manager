// runtime: node 22, firebase-functions v7
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as cheerio from 'cheerio'

const SPOONACULAR_KEY = defineSecret('SPOONACULAR_KEY')

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'no-cache',
}

function flatten(value) {
  if (!value) return []
  return Array.isArray(value) ? value.flatMap(flatten) : [value]
}

function findRecipeNode(data) {
  const nodes = flatten(data)
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const type = node['@type']
    const types = Array.isArray(type) ? type : [type]
    if (types.includes('Recipe')) return node
    if (node['@graph']) {
      const found = findRecipeNode(node['@graph'])
      if (found) return found
    }
  }
  return null
}

function parseDuration(iso) {
  if (!iso || typeof iso !== 'string') return null
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return null
  const h = parseInt(match[1] || 0, 10)
  const m = parseInt(match[2] || 0, 10)
  return h * 60 + m || null
}

function normalizeIngredients(list) {
  if (!Array.isArray(list)) return []
  return list.map(s => String(s).trim()).filter(Boolean)
}

function normalizeInstructions(list) {
  if (!list) return null
  if (typeof list === 'string') return list
  if (!Array.isArray(list)) return null
  return list
    .map(step => {
      if (typeof step === 'string') return step
      if (step?.text) return step.text
      if (step?.name) return step.name
      return null
    })
    .filter(Boolean)
    .join('\n\n')
}

export const importRecipeFromUrl = onCall({ cors: true }, async (request) => {
  const url = request.data?.url
  if (!url || typeof url !== 'string') {
    throw new HttpsError('invalid-argument', 'url required')
  }

  let referer = ''
  let host = 'that site'
  try {
    const u = new URL(url)
    referer = u.origin + '/'
    host = u.hostname.replace(/^www\./, '')
  } catch {}

  let res
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        ...(referer ? { 'Referer': referer } : {}),
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })
  } catch (e) {
    throw new HttpsError('unavailable', `Couldn't reach the recipe page: ${e.message}`)
  }

  if (!res.ok) {
    const s = res.status
    if (s === 404) {
      throw new HttpsError('not-found', `Recipe page not found at ${host} (HTTP 404).`)
    }
    if (s === 429) {
      throw new HttpsError('resource-exhausted', `${host} is rate-limiting us (HTTP 429). Try again in a minute.`)
    }
    if (s >= 400 && s < 500) {
      throw new HttpsError(
        'failed-precondition',
        `${host} blocks recipe imports (HTTP ${s}). Try a different URL or add the recipe manually.`
      )
    }
    throw new HttpsError('unavailable', `${host} returned HTTP ${s}. Try again in a moment.`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const blocks = $('script[type="application/ld+json"]')

  let recipe = null
  blocks.each((_, el) => {
    if (recipe) return
    const raw = $(el).contents().text()
    try {
      const parsed = JSON.parse(raw)
      recipe = findRecipeNode(parsed)
    } catch {
      // ignore malformed JSON-LD
    }
  })

  if (!recipe) {
    throw new HttpsError('not-found', 'No Recipe schema found on page')
  }

  return {
    name: recipe.name || null,
    description: recipe.description || null,
    image: Array.isArray(recipe.image) ? recipe.image[0] : (recipe.image?.url || recipe.image || null),
    cookTime: parseDuration(recipe.totalTime) || parseDuration(recipe.cookTime),
    servings: recipe.recipeYield ? parseInt(String(recipe.recipeYield).match(/\d+/)?.[0] || 0, 10) || null : null,
    ingredients: normalizeIngredients(recipe.recipeIngredient),
    instructions: normalizeInstructions(recipe.recipeInstructions),
    cuisine: Array.isArray(recipe.recipeCuisine) ? recipe.recipeCuisine[0] : (recipe.recipeCuisine || null),
    sourceUrl: url,
  }
})

export const searchRecipes = onCall({ cors: true, secrets: [SPOONACULAR_KEY] }, async (request) => {
  const query = request.data?.query
  const offset = Number.isInteger(request.data?.offset) ? request.data.offset : 0
  if (!query || typeof query !== 'string') {
    throw new HttpsError('invalid-argument', 'query required')
  }

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_KEY.value(),
    query,
    number: '12',
    offset: String(offset),
    addRecipeInformation: 'true',
  })

  const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`)
  if (!res.ok) {
    throw new HttpsError('unavailable', `Spoonacular HTTP ${res.status}`)
  }

  const data = await res.json()
  return {
    totalResults: data.totalResults || 0,
    offset: data.offset || 0,
    number: data.number || 0,
    results: (data.results || []).map(r => ({
      id: r.id,
      name: r.title,
      image: r.image,
      cookTime: r.readyInMinutes || null,
      servings: r.servings || null,
      cuisine: r.cuisines?.[0] || null,
      sourceUrl: r.sourceUrl || null,
      ingredients: (r.extendedIngredients || []).map(i => i.original),
    })),
  }
})

export const getRecipeDetails = onCall({ cors: true, secrets: [SPOONACULAR_KEY] }, async (request) => {
  const id = request.data?.id
  if (!id) throw new HttpsError('invalid-argument', 'id required')

  const params = new URLSearchParams({ apiKey: SPOONACULAR_KEY.value() })
  const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?${params}`)
  if (!res.ok) {
    throw new HttpsError('unavailable', `Spoonacular HTTP ${res.status}`)
  }

  const r = await res.json()
  return {
    name: r.title,
    image: r.image,
    cookTime: r.readyInMinutes || null,
    servings: r.servings || null,
    cuisine: r.cuisines?.[0] || null,
    ingredients: (r.extendedIngredients || []).map(i => i.original),
    instructions: r.instructions || null,
    sourceUrl: r.sourceUrl || null,
  }
})

function normalizeHost(input) {
  if (!input) return null
  let s = String(input).trim().toLowerCase()
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
  return s || null
}

async function searchOneSite(host, query) {
  const searchUrl = `https://${host}/?s=${encodeURIComponent(query)}`
  let res
  try {
    res = await fetch(searchUrl, { headers: BROWSER_HEADERS, redirect: 'follow' })
  } catch (e) {
    return { host, error: `Couldn't reach ${host}`, results: [] }
  }
  if (!res.ok) return { host, error: `${host} returned HTTP ${res.status}`, results: [] }

  const html = await res.text()
  const $ = cheerio.load(html)
  const seen = new Set()
  const results = []

  $('article').each((_, article) => {
    if (results.length >= 8) return
    const $a = $(article)
    const link = $a.find('h2 a, h1 a, a.entry-title-link, a[rel="bookmark"]').first()
    if (!link.length) return
    const href = link.attr('href')
    const title = (link.text() || link.attr('title') || $a.attr('aria-label') || '').trim()
    if (!href || !title) return
    let normalizedUrl
    try {
      const u = new URL(href, `https://${host}`)
      if (!u.hostname.replace(/^www\./, '').endsWith(host)) return
      normalizedUrl = u.toString()
    } catch { return }
    if (seen.has(normalizedUrl)) return
    seen.add(normalizedUrl)
    const imgEl = $a.find('img').first()
    const image =
      imgEl.attr('src') ||
      imgEl.attr('data-src') ||
      imgEl.attr('data-lazy-src') ||
      imgEl.attr('data-original') ||
      null
    results.push({ title, url: normalizedUrl, image, host })
  })

  return { host, results }
}

export const searchTrustedSites = onCall({ cors: true, timeoutSeconds: 30 }, async (request) => {
  const query = request.data?.query
  const rawSites = request.data?.sites
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new HttpsError('invalid-argument', 'query required')
  }
  if (!Array.isArray(rawSites) || rawSites.length === 0) {
    throw new HttpsError('invalid-argument', 'sites required')
  }
  const sites = [...new Set(rawSites.map(normalizeHost).filter(Boolean))].slice(0, 10)
  if (sites.length === 0) {
    throw new HttpsError('invalid-argument', 'no valid sites')
  }

  const perSite = await Promise.all(sites.map(s => searchOneSite(s, query.trim())))
  return {
    results: perSite.flatMap(s => s.results),
    sites: perSite.map(({ host, error, results }) => ({ host, error: error || null, count: results.length })),
  }
})
