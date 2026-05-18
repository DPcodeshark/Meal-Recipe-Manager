# Dinner App — Family Meal Planner

## What It Does

A mobile-first PWA that lets a family of 5 (Erika, Merrill, Cory, Avery, Radek) plan weekly dinners together. Core flows:

1. **Multi-week planner** — vertical strip of weeks with 7-day rows; click any day square to open detail
2. **Meal sidebar** — searchable list of every meal in the library; click a meal → click a day → assigned
3. **Meal library** — import recipes from any URL or via Spoonacular search; cuisine/dietary tags; favorites
4. **Grocery list** — auto-generated from planned meals across selected weeks; per-item aisle assignment with learning; pantry cross-reference
5. **Pantry** — track what's on hand; items marked "have" auto-check on the grocery list
6. **Settings** — family members, PIN, editable cuisine tags

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Routing | react-router-dom v7 |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Anonymous Auth + family PIN |
| Cloud Functions | Firebase Functions v2 (Node 20, Gen 2 / Cloud Run) |
| Recipe import | Server-side JSON-LD parsing (cheerio) + Spoonacular API |
| Icons | lucide-react |
| Dates | date-fns |
| PWA | vite-plugin-pwa (Workbox) |
| Hosting | Firebase Hosting |

## Project Structure

```
src/
├── App.jsx              # Routes + shell
├── App.css              # All styles (single file, mobile-first)
├── main.jsx             # Entry point
├── firebase/
│   └── config.js        # Firebase init + getFunctions export
├── context/
│   └── FamilyContext.jsx
├── pages/
│   ├── Login.jsx        # PIN entry + member picker
│   ├── WeekView.jsx     # Planner — multi-week grid + meal-list sidebar
│   ├── DayDetail.jsx    # Per-day assignment + (legacy) suggestion UI
│   ├── MealLibrary.jsx  # Inline Import (search/URL) + filters + library
│   ├── GroceryList.jsx  # Aisle-grouped list with learning aisle map
│   ├── Pantry.jsx
│   └── Settings.jsx     # Family, members, editable cuisine tags
├── components/
│   ├── NavBar.jsx       # Bottom tab navigation (Plan/Meals/List/Pantry/Settings)
│   └── KeepAlive.jsx    # Mounts tab pages once, toggles display (preserves filter state)
├── data/
│   └── seedMeals.js     # ~80 family-safe dinners (no chicken — Merrill allergy)
└── utils/
    ├── constants.js     # Defaults (cuisines, aisles, member colors)
    └── dates.js         # Week ID helpers

functions/
├── index.js             # importRecipeFromUrl, searchRecipes, getRecipeDetails
└── package.json         # firebase-functions v6, cheerio
```

## Firestore Data Model

```
families/{familyId}
  ├── name: string
  ├── pin: string (4-digit)
  ├── members: [{ name, role, dietary? }]
  ├── cuisines: string[]              # editable in Settings; falls back to defaults
  ├── aisles: string[]                # grocery store aisle order
  ├── createdAt: ISO string
  │
  ├── weeks/{weekId}                  # weekId = "2026-05-11" (Monday)
  │     └── days: {
  │           "2026-05-11": { assignedTo, meal }, ...
  │         }
  │
  ├── meals/{mealId}
  │     ├── name, cuisine, cookTime, servings, dietary[], ingredients[]
  │     ├── instructions, image, sourceUrl, notes
  │     ├── source: "manual" | "seed" | "url" | "spoonacular"
  │     ├── addedBy, favorite, timesCooked, createdAt
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
  │     └── mappings: { "ingredient name": "Aisle" }  # learned from grocery list assignments
  │
  └── suggestions/{id}                 # DEPRECATED — collection still exists but no UI reads it
```

## Cloud Functions

Three callable functions in `us-central1` (Gen 2 / Cloud Run):

| Function | Purpose |
|---|---|
| `importRecipeFromUrl` | Fetches a recipe URL, parses Schema.org JSON-LD `Recipe`, returns name/ingredients/instructions/cookTime/servings/image/sourceUrl |
| `searchRecipes` | Spoonacular `complexSearch` (12 results/page, paginated via `offset`). Cheap: `addRecipeInformation=true` but NOT `fillIngredients` |
| `getRecipeDetails` | Spoonacular `/{id}/information` — fetches full ingredients + instructions on import-click only |

**Secret:** `SPOONACULAR_KEY` (Secret Manager). Set via `firebase functions:secrets:set SPOONACULAR_KEY`.

**Public invoker:** all three have `allUsers` granted `roles/run.invoker` (set via `gcloud run services add-iam-policy-binding`). v2 callables need this for browser CORS to pass preflight.

## Setup (new developer)

1. Clone the repo
2. Create a Firebase project (Blaze plan required for v2 Functions)
3. Enable: Firestore (test mode), Anonymous Auth, Cloud Run Admin API, Cloud Build API, Artifact Registry API
4. Copy `.env.example` → `.env`, fill in Firebase web config
5. `npm install`
6. `cd functions && npm install`
7. Get a Spoonacular API key (free tier — https://spoonacular.com/food-api)
8. `firebase functions:secrets:set SPOONACULAR_KEY` (paste key)
9. `firebase deploy --only functions`
10. After first function deploy, grant public invoker:
    ```bash
    for FN in searchRecipes importRecipeFromUrl getRecipeDetails; do
      gcloud run services add-iam-policy-binding $(echo $FN | tr '[:upper:]' '[:lower:]') \
        --member=allUsers --role=roles/run.invoker --region=us-central1
    done
    ```
11. `npm run dev`

## Deploy

```bash
npm run build && firebase deploy --only hosting
firebase deploy --only functions   # when functions/index.js changes
```

## Notable Design Decisions

- **KeepAlive pattern** — tab pages mount once and toggle visibility, so search/filter state survives navigation
- **Server-side recipe parsing** — never embed Spoonacular key in the client; URL fetches need CORS-bypass anyway
- **Recipe ingredients lazy-loaded** — search results don't include ingredients (saves API quota); fetched only when user clicks +
- **Source tracking** — every meal records `source: manual/seed/url/spoonacular` to enable Imported vs Added filters
- **Learning aisle map** — assigning an aisle to "ground beef" persists at family level; new ingredients with similar names auto-inherit
- **Suggestions deprecated** — the Plan sidebar now shows the full meal library directly. No more two-step "suggest → vote → assign" flow.
- **Whole day square is clickable** — navigates to day detail; clear-meal X stops propagation
- **Editable cuisine tags** — `family.cuisines` is the source of truth; `CUISINE_TAGS` in constants is just the seed default

## Pre-deploy gotchas

- **First-time function deploy** fails until Cloud Run + Cloud Build + Artifact Registry APIs are enabled and Blaze plan is active
- **CORS errors on callable functions** = `allUsers` doesn't have `run.invoker` (see step 10 above). Symptom: "No Access-Control-Allow-Origin header" with a 403 preflight
- **Spoonacular quota** is in points, not calls. 150 points/day free. A 12-result search ≈ 0.5–1 point. Avoid `fillIngredients` on search calls.

## PWA / iPhone

- Install: Safari → Share → Add to Home Screen
- Works offline for previously loaded data (Firestore offline persistence)
- For App Store: wrap with Capacitor (see prior version of this doc)

## Future Ideas

- Backfill old `notes`-stored URLs into `sourceUrl` field
- Per-week (not just family-wide) grocery list state
- "Haven't cooked in X weeks" surfacing
- Cooking history (`timesCooked` increment on assignment)
- Drag-and-drop reorder of days
- Member dietary cross-reference at assignment time (warn if planned meal conflicts)
