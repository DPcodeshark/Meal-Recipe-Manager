# Dinner App — Family Meal Planner

Lives at **https://zavods.com/meals**. Sister site at **https://zavods.com/learn** is a 14-lesson instructional companion teaching the family how the app was built and how to maintain it with Claude Code. Root `https://zavods.com` serves a small landing page linking to both. Firebase project `zavod-meals`. Repo (public): https://github.com/DPcodeshark/Meal-Recipe-Manager.

## What It Does

A mobile-first PWA that lets a family of 5 (Erika, Merrill, Cory, Avery, Radek) plan weekly dinners together. Core flows:

1. **Multi-week planner** — vertical strip of weeks with 7-day tile grid; tap a day to open detail; tap the assignee badge to set/clear the cook; drag a meal from the sidebar onto a day to assign (desktop only — HTML5 native DnD, doesn't fire on iOS touch)
2. **Meal sidebar** — searchable list of every meal in the library; thumbnail or cuisine emoji + name
3. **Meal library** — unified "Search / Add" across favorite recipe sites *and* Spoonacular (Spoonacular kept invisible to users), Paste URL, and Add manually; cuisine/dietary tags; family favorite star; per-member 👍/👎 ratings; "Most Loved" sort
4. **Grocery list** — auto-generated from planned meals across selected weeks; per-item aisle assignment with learning (exact-key only — no more aisle bleed); pantry cross-reference
5. **Pantry** — track what's on hand; items marked "have" auto-check on the grocery list
6. **Settings** — family members + per-member emoji avatars, PIN, editable cuisine tags, favorite recipe sites, theme picker (Warm / Midnight)

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite |
| Routing | react-router-dom v7 with `basename="/meals"` |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Anonymous Auth + family PIN |
| Cloud Functions | Firebase Functions v7 (Node 22, Gen 2 / Cloud Run) |
| Recipe import | Server-side JSON-LD parsing (cheerio) + Spoonacular API + WordPress search scraping |
| Icons | lucide-react |
| Fonts | Fraunces (display) + Inter (body), via Google Fonts |
| Dates | date-fns |
| PWA | vite-plugin-pwa (Workbox), scoped to `/meals/` |
| Hosting | Firebase Hosting (single site, two paths: `/` landing, `/meals/` SPA) |
| Repo | https://github.com/DPcodeshark/Meal-Recipe-Manager |

## Project Structure

```
.
├── index.html              # SPA shell — references /meals/-prefixed assets, data-theme="warm"
├── landing/
│   └── index.html          # Standalone static landing page for zavods.com root
├── learn/                  # /learn instructional site — separate React+Vite app
│   ├── index.html          # entry; data-theme="warm"
│   ├── public/             # static assets including 4 inline lesson screenshots (firestore-console.png, hosting-deploys.png, functions-dashboard.png, github-tree.png) + chef-hat favicon.svg
│   └── src/
│       ├── main.jsx        # entry with BrowserRouter basename="/learn"
│       ├── App.jsx         # routes: / (Home) and /lessons/:slug; mounts <ScrollToTop/>
│       ├── App.css         # warm theme + lesson typography + quiz styling
│       ├── lessons/        # one JSX file per lesson, registered in index.js
│       │   ├── index.js    # LESSONS array + findLesson(slug) helper
│       │   ├── 01-welcome.jsx ... 14-where-next.jsx  # 14 lessons total
│       ├── pages/
│       │   └── Home.jsx    # landing for /learn — hero + curriculum TOC
│       └── components/
│           ├── Layout.jsx       # header + sidebar nav + mobile drawer
│           ├── LessonChrome.jsx # lesson header + prev/next footer
│           ├── Quiz.jsx         # data-driven multiple-choice with inline explanations
│           └── ScrollToTop.jsx  # resets scroll on route change
├── scripts/
│   ├── post-build.js       # Copies landing/ → dist/ after `vite build` writes dist/meals/
│   └── generate-icons.js   # Renders favicon.svg → PNG sizes via sharp
├── vite.config.js          # base: '/meals/', outDir: 'dist/meals/', PWA scope/start_url '/meals/'
├── vite.learn.config.js    # base: '/learn/', outDir: 'dist/learn/'; no PWA (read-only doc site)
├── firebase.json           # Hosting public: 'dist'; rewrites /meals/** and /learn/** → respective index.html
├── src/
│   ├── App.jsx             # Routes + shell, BrowserRouter basename="/meals"
│   ├── App.css             # All component styles (single file). Theme tokens under [data-theme="warm"] (default) and [data-theme="midnight"]
│   ├── main.jsx            # Entry point
│   ├── firebase/config.js  # Firebase init
│   ├── context/
│   │   └── FamilyContext.jsx  # Family state; applies data-theme attribute from family.theme
│   ├── pages/
│   │   ├── Login.jsx       # PIN entry + member picker, emoji avatars
│   │   ├── WeekView.jsx    # Planner — tile-style day cards, assignee picker, sidebar with thumbnails, drag-and-drop
│   │   ├── DayDetail.jsx   # Per-day assignment + (legacy) suggestion UI
│   │   ├── MealLibrary.jsx # Inline Search/Add (unified) + Paste URL + Add manually, ratings UI, filters
│   │   ├── GroceryList.jsx # Aisle-grouped list with learning aisle map (exact-key match)
│   │   ├── Pantry.jsx
│   │   └── Settings.jsx    # Appearance, family, members + emoji picker, cuisine tags, favorite recipe sites
│   ├── components/
│   │   ├── NavBar.jsx
│   │   └── KeepAlive.jsx   # Mounts tab pages once, toggles display (preserves filter state)
│   ├── data/
│   │   └── seedMeals.js    # Used only by the legacy "Remove N seed" cleanup button
│   └── utils/
│       ├── constants.js    # MEMBER_COLORS, MEMBER_EMOJI, EMOJI_PALETTE, CUISINE_EMOJI, CUISINE_TAGS, DIETARY_TAGS, AISLE_ORDER, DEFAULT_AISLES, DEFAULT_TRUSTED_SITES, getMemberEmoji()
│       └── dates.js        # Week ID helpers
│
└── functions/
    ├── index.js            # importRecipeFromUrl, searchRecipes, getRecipeDetails, searchTrustedSites
    └── package.json        # firebase-functions v7, firebase-admin v13, cheerio; Node 22 engines
```

## Firestore Data Model

```
families/{familyId}
  ├── name: string
  ├── pin: string (4-digit)
  ├── theme: "warm" | "midnight"           # default "warm" if unset
  ├── members: [{ name, role, emoji?, dietary? }]
  ├── cuisines: string[]                   # editable in Settings; falls back to CUISINE_TAGS
  ├── aisles: string[]                     # grocery store aisle order; falls back to DEFAULT_AISLES
  ├── trustedSites: string[]               # hostnames (e.g. "livelytable.com"); falls back to DEFAULT_TRUSTED_SITES
  ├── createdAt: ISO string
  │
  ├── weeks/{weekId}                       # weekId = "2026-05-11" (Monday)
  │     └── days: {
  │           "2026-05-11": { assignedTo, meal }, ...
  │         }
  │
  ├── meals/{mealId}
  │     ├── name, cuisine, cookTime, servings, dietary[], ingredients[]
  │     ├── instructions, image, sourceUrl, notes
  │     ├── source: "manual" | "seed" | "url" | "spoonacular"
  │     ├── addedBy, favorite, timesCooked, createdAt
  │     ├── ratings: { [memberName]: "up" | "down" }   # optional, per-member thumbs
  │
  ├── pantry/{itemId}
  │     ├── name, aisle, have, addedAt
  │
  ├── groceryLists/current
  │     ├── checked: { "ingredient": bool }
  │     ├── aisles:  { "ingredient": "Produce" }    # per-item explicit aisle
  │     └── pantryFlags: { "ingredient": bool }
  │
  ├── settings/aisleMap
  │     └── mappings: { "ingredient name": "Aisle" }  # learned from grocery list assignments; exact-key match
  │
  └── suggestions/{id}                     # DEPRECATED — collection still exists but no UI reads it
```

**Note on theme/trustedSites/member.emoji:** these are optional fields. The client reads them with `family?.theme === 'midnight' ? 'midnight' : 'warm'` style fallbacks, so families created before these features still work. Setting any value via Settings persists it.

## Cloud Functions

Four callable functions in `us-central1` (Gen 2 / Cloud Run, Node 22, firebase-functions v7):

| Function | Purpose |
|---|---|
| `importRecipeFromUrl` | Fetches a recipe URL with a full browser-shaped UA + headers (Sec-Fetch-*, Accept-Language, Referer), parses Schema.org JSON-LD `Recipe`. Returns name/ingredients/instructions/cookTime/servings/image/sourceUrl. Maps upstream 4xx → `failed-precondition` ("blocks recipe imports — add manually"), 404 → `not-found`, 429 → `resource-exhausted`, 5xx → `unavailable`. Includes the host in error messages. |
| `searchRecipes` | Spoonacular `complexSearch` (12 results/page, paginated via `offset`). Cheap: `addRecipeInformation=true` but NOT `fillIngredients`. **Hidden from UI** — the "Search / Add" tab uses this but never labels it. |
| `getRecipeDetails` | Spoonacular `/{id}/information` — fetches full ingredients + instructions on import-click only |
| `searchTrustedSites` | Scrapes WordPress search pages (`/?s=query`) of every site in `family.trustedSites` in parallel via cheerio. Extracts title/URL/image from `<article>` cards. 30s timeout. Returns aggregated results + per-site status (count or error). |

**Browser headers (shared `BROWSER_HEADERS` constant in `functions/index.js`):**
Chrome 124 UA + Accept-Language + Sec-Fetch-* + Upgrade-Insecure-Requests. Plus a per-request Referer set to the URL's origin. Gets us past most sites; sites with Cloudflare bot-management (e.g. allrecipes.com) still block — the friendly error message handles that case.

**Secret:** `SPOONACULAR_KEY` (Secret Manager). Set via `firebase functions:secrets:set SPOONACULAR_KEY`.

**Public invoker:** all four have `allUsers` granted `roles/run.invoker` (set via `gcloud run services add-iam-policy-binding`). v2 callables need this for browser CORS to pass preflight.

## Design System

The 2026-05 redesign moved the app from "dark AI dashboard" to "warm kitchen counter."

**Themes (`[data-theme]` attribute on `<html>`):**
- **Warm** (default): cream `#fdf8f1` bg, paper `#ffffff` surfaces, paprika `#d97757` accent, sage `#5a8f6a` success, beige `#ead9c5` border, ink `#3a2f2a` text
- **Midnight**: warm charcoal `#211c1a` bg with a peachy `#f0a060` accent — *not* the old purple-slate

`FamilyContext.jsx` writes `document.documentElement.setAttribute('data-theme', ...)` from `family.theme`, plus updates the `meta[name="theme-color"]` content so the PWA chrome matches.

**Typography:** Fraunces 60 (opsz axis) for `h1/h2/h3` + week labels + day numbers + login hero; Inter for everything else. Loaded from Google Fonts in `index.html` and `landing/index.html`.

**Emoji avatars:** each family member can pick an emoji (Settings → emoji picker, curated palette + free-form fallback in `constants.js` → `EMOJI_PALETTE`). Shown on Login member picker and Settings rows. **Planner uses first-letter initials** (not emoji) — the user specifically wanted letters on day-card assignee badges and the assignee picker so they're scan-able at the small day-card size; emojis live everywhere else.

## Cross-cutting UX patterns

- **KeepAlive pattern** — tab pages mount once and toggle visibility, so search/filter state survives navigation
- **Theme attribute on `<html>`** — set as early as `index.html`'s `<html data-theme="warm">` so first paint is warm; React then overrides if `family.theme === 'midnight'`
- **Click-outside handlers** — Settings emoji picker, Grocery aisle dropdown, WeekView assignee picker all use a `useRef` + document `mousedown` listener pattern; Grocery and Settings also handle Escape
- **Per-member ratings** — stored on the meal doc; both compact aggregate (👍 N badge in meta) and full breakdown (Your rating + Others) shown in the expanded card. Only the current user's chip is interactive
- **Server-side recipe parsing** — never embed Spoonacular key in the client; URL fetches need CORS-bypass anyway
- **Recipe ingredients lazy-loaded** — search results don't include ingredients (saves API quota); fetched only when user clicks +
- **Source tracking** — every meal records `source: manual/seed/url/spoonacular` to enable Imported vs Added filters
- **Aisle map is exact-key only** — previous fuzzy substring matching caused "set aisle for tomato" to also touch "tomato sauce" / "cherry tomatoes"; now only an identical normalized ingredient name inherits a learned aisle
- **Suggestions deprecated** — the Plan sidebar shows the full meal library directly. No more two-step "suggest → vote → assign" flow.
- **Whole day square is clickable** — navigates to day detail; clear-meal X, assignee badge popover, and meal thumb all stop propagation
- **Drag-and-drop assignment** (desktop only) — sidebar meal pills are `draggable`; day cards are drop targets. Mobile users still use the existing tap-meal-then-tap-day flow (HTML5 DnD doesn't fire on iOS Safari touch)
- **Editable cuisine tags + trusted sites** — `family.cuisines` and `family.trustedSites` are the source of truth; the constants are just seed defaults

## Hosting architecture

Single Firebase Hosting site, **three** paths:

```
zavods.com/        → dist/index.html        (landing page, plain static HTML, links to /meals/ and /learn/)
zavods.com/meals/* → dist/meals/index.html  (Dinner App React SPA, with rewrite for deep links)
zavods.com/learn/* → dist/learn/index.html  (Learn instructional site, separate React SPA)
```

**Key config:**
- `vite.config.js` → builds the Dinner App. `base: '/meals/'` + `build.outDir: 'dist/meals'`. Has the PWA plugin.
- `vite.learn.config.js` → builds the Learn site. `root: 'learn'`, `base: '/learn/'`, `build.outDir: '../dist/learn'`. No PWA plugin (read-only doc site, not installable).
- Both share the same `package.json` + `node_modules` at the repo root.
- `vite-plugin-pwa` workbox config for the meals app → `navigateFallback: '/meals/index.html'`, `navigateFallbackAllowlist: [/^\/meals\//]` so the SW doesn't hijack landing or /learn requests.
- `src/App.jsx` → `<BrowserRouter basename="/meals">`; `learn/src/main.jsx` → `<BrowserRouter basename="/learn">`.
- `firebase.json` → `hosting.rewrites` maps `/meals/**` and `/learn/**` to their respective `index.html` for client-side routing.
- `scripts/post-build.js` → after both vite builds, copies `landing/*` over `dist/*`, putting the landing's `index.html` at `dist/index.html`.
- Root build script: `"build": "vite build && vite build --config vite.learn.config.js && node scripts/post-build.js"`.

**Why this structure:** keeps SPA assets cleanly under `/meals/`, lets the landing be a single hand-edited HTML file, avoids any rewrite/router conflict between root and SPA. Custom domain (zavods.com → Firebase) is configured in the Firebase Hosting console.

## Setup (new developer)

1. Clone `https://github.com/DPcodeshark/Meal-Recipe-Manager.git`
2. Get added to the `zavod-meals` Firebase project (Blaze plan required for v2 Functions)
3. Enable in the project: Firestore (test mode), Anonymous Auth, Cloud Run Admin API, Cloud Build API, Artifact Registry API
4. Copy `.env.example` → `.env`, fill in Firebase web config
5. `npm install`
6. `cd functions && npm install`
7. (If Spoonacular secret isn't set yet) `firebase functions:secrets:set SPOONACULAR_KEY` (paste key from https://spoonacular.com/food-api)
8. `firebase deploy --only functions`
9. After first function deploy, grant public invoker:
   ```bash
   for FN in searchRecipes importRecipeFromUrl getRecipeDetails searchTrustedSites; do
     gcloud run services add-iam-policy-binding $(echo $FN | tr '[:upper:]' '[:lower:]') \
       --member=allUsers --role=roles/run.invoker --region=us-central1
   done
   ```
10. `npm run dev` (serves on localhost, but note Vite dev server respects `base: '/meals/'` — open http://localhost:5173/meals/)

## Deploy

```bash
npm run build && firebase deploy --only hosting    # SPA + landing
firebase deploy --only functions                   # when functions/index.js changes
```

`npm run build` chains `vite build` (writes `dist/meals/`) then `node scripts/post-build.js` (copies `landing/` over `dist/`).

## Pre-deploy gotchas (learned the hard way)

- **First-time function deploy** fails until Cloud Run + Cloud Build + Artifact Registry APIs are enabled and Blaze plan is active.
- **CORS errors on callable functions** = `allUsers` doesn't have `run.invoker` on that specific function. Symptom: "No Access-Control-Allow-Origin header" with a 403 preflight. Run the per-function grant above; remember to add any *new* function to the list.
- **Spoonacular quota** is in points, not calls. 150 points/day free tier. A 12-result search ≈ 0.5–1 point. Avoid `fillIngredients` on search calls.
- **Bumping the Node runtime requires editing both `firebase.json` AND touching the source.** `firebase.json`'s `runtime: "nodejsXX"` is the actually-controlling field — `functions/package.json`'s `engines.node` is informational only. Also, `firebase deploy --only functions` will *skip* the deploy if only `firebase.json` changed (it hashes the JS bundle for change detection). So when changing runtime, also bump a comment or version string in `functions/index.js` to force the deploy through.
- **Vite hosting subpath** — if you change `base` in vite.config.js, also update `BrowserRouter basename`, `VitePWA` `start_url`/`scope`/`navigateFallback`, and `firebase.json` rewrites. All four must agree.

## PWA / iPhone

- Install: Safari → Share → Add to Home Screen — open **https://zavods.com/meals** first, then install (PWA scope is `/meals/`, so installing from the root landing won't capture the app)
- Works offline for previously loaded data (Firestore offline persistence)
- **Cross-origin migration**: existing users on the old `zavod-meals.web.app` install need to delete the old home-screen icon and reinstall from `zavods.com/meals` — PWAs can't migrate across origins
- For App Store: wrap with Capacitor (see prior version of this doc)

## DNS / custom domain notes

- `zavods.com` is at GoDaddy (nameservers `ns45/ns46.domaincontrol.com`)
- Required records (set in Firebase Console → Hosting → Add custom domain):
  - `A @ 199.36.158.100` (Firebase IP)
  - `TXT @ hosting-site=zavod-meals` (ownership verification)
- **GoDaddy gotcha**: a "WebsiteBuilder Site" entry in the DNS records table doesn't show as literal A records but silently injects GoDaddy's AWS-hosted parking IPs (13.248.243.5, 76.223.105.230). If those phantom records appear during setup, delete the "WebsiteBuilder Site" row directly — it's hidden from "Forwarding" but visible in the DNS Records table.

## Future Ideas

Cleaned up — moved completed items into the body of this doc.

- Backfill old `notes`-stored URLs into `sourceUrl` field
- Per-week (not just family-wide) grocery list state
- Cooking history (`timesCooked` increment on assignment / day-passed)
- "Haven't cooked in X weeks" surfacing in the planner sidebar
- Dietary cross-reference at assignment time (warn if planned meal conflicts with a member's dietary flag — Merrill's chicken allergy is a real safety win here)
- Touch drag-and-drop on mobile (would need `@dnd-kit/core`; current DnD is HTML5 native, desktop only)
- Custom meal slots per day (breakfast/dinner/leftover/takeout — currently one slot per day)
- Day notes (free text per day, e.g. "Cory has soccer 6pm")
- Themed days defaults (Taco Tuesday, Pasta Friday)
- Print / share weekly menu (pin to the fridge)
- Cooking mode (clean reader view of ingredients + steps, no nav, for phone-propped-in-kitchen use)
