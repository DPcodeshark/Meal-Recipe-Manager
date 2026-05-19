import Quiz from '../components/Quiz.jsx'

export default function CloudFunctions() {
  return (
    <>
      <p className="lead">
        Most of the app runs in the browser — but four small chunks of logic
        run on Google's servers instead, on demand. Those are the{' '}
        <strong>Cloud Functions</strong>. This lesson covers what they are, why
        you'd reach for one, and walks through each of ours.
      </p>

      <h2>What is a "serverless function"?</h2>
      <p>
        Old way: rent a server, keep it running 24/7, host your backend on it,
        pay even when nobody's visiting. New way: write a function, upload it
        to Google; Google runs it when called, charges you per-invocation, and
        spins it back down when idle. Hence "serverless" — there is a server,
        you just don't manage it.
      </p>
      <p>
        For the Dinner App's traffic (a family of five), the four functions
        cost <strong>zero dollars</strong> per month — well within Google's
        free tier (2M invocations/month free).
      </p>

      <h2>Why functions exist at all (the browser limits)</h2>
      <p>Three things browsers can't safely do that often you'd want to:</p>
      <ol>
        <li>
          <strong>Talk to other domains</strong> without permission. Browsers
          enforce something called CORS (Cross-Origin Resource Sharing) — by
          default, code at <code>zavods.com</code> can't fetch from{' '}
          <code>allrecipes.com</code>. Allrecipes hasn't given us permission;
          the browser refuses on principle. <strong>Servers don't have this
          restriction.</strong>
        </li>
        <li>
          <strong>Hold secrets.</strong> If you embed a Spoonacular API key in
          your React code, it gets shipped to every user. Anyone can open
          DevTools and copy it. Servers can hold secrets safely.
        </li>
        <li>
          <strong>Run privileged operations</strong> like sending email,
          charging credit cards, talking to other Google services with admin
          rights. All things you'd never give to a browser.
        </li>
      </ol>
      <p>Cloud Functions solve all three. They're the place to put backend logic that's too risky or impossible to run in the browser.</p>

      <h2>The four functions in this app</h2>
      <p>All live in <code>functions/index.js</code>:</p>

      <h3>importRecipeFromUrl</h3>
      <p>
        Takes a URL like <code>livelytable.com/some-recipe</code>, fetches the
        HTML server-side (browsers couldn't), parses out the structured recipe
        data (the JSON-LD <code>{`<script type="application/ld+json">`}</code>{' '}
        block that Google requires for SEO), and returns a clean object the
        React app can save to Firestore.
      </p>
      <p>
        Why a function: CORS. The Dinner App can't fetch livelytable.com
        directly from the browser. The function can, then passes the result
        back through Firebase's same-origin pipe.
      </p>

      <h3>searchRecipes</h3>
      <p>
        Hits the Spoonacular search API with a user's query and returns
        results. Spoonacular needs a private API key.
      </p>
      <p>Why a function: secret-keeping. The key lives in Google Secret Manager and only the function can read it.</p>

      <h3>getRecipeDetails</h3>
      <p>
        Same idea, different endpoint — fetches a single Spoonacular recipe's
        full details (ingredients, instructions) by ID.
      </p>

      <h3>searchTrustedSites</h3>
      <p>
        Scrapes the WordPress-style search pages of each site in a family's
        "favorite recipe sites" list, in parallel. Returns a unified list of
        recipe links across all the family's preferred sites.
      </p>
      <p>Why a function: CORS again. Browsers can't scrape arbitrary websites.</p>

      <h2>How the client calls a function</h2>
      <p>Look at any function call in the React code, e.g. <code>src/pages/MealLibrary.jsx</code>:</p>
      <pre><code>{`import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase/config'

const fn = httpsCallable(functions, 'searchRecipes')
const { data } = await fn({ query: 'meatloaf' })`}</code></pre>
      <p>
        That's it. Firebase handles the network call, the auth, the
        serialization. The function gets invoked, returns its result, and you
        get the data back. No URL strings, no JSON.stringify, no fetch
        boilerplate.
      </p>

      <h2>How the function is written</h2>
      <p>The pattern, from <code>functions/index.js</code>:</p>
      <pre><code>{`import { onCall, HttpsError } from 'firebase-functions/v2/https'

export const searchRecipes = onCall({ cors: true }, async (request) => {
  const query = request.data?.query
  if (!query) throw new HttpsError('invalid-argument', 'query required')

  // ... do the actual work ...

  return { results: [...] }
})`}</code></pre>
      <p>
        Three things to notice: the function is just a normal async JavaScript
        function. <code>HttpsError</code> is the way to surface errors back to
        the client (with a code like <code>invalid-argument</code> that maps to
        a sensible HTTP status). And the <code>cors: true</code> option lets
        the browser call it.
      </p>

      <h2>Secrets</h2>
      <p>The Spoonacular API key is too sensitive to commit to git. Two key bits:</p>
      <ul>
        <li>
          Stored in <strong>Google Secret Manager</strong>, encrypted at rest,
          access-controlled.
        </li>
        <li>
          Set once via <code>firebase functions:secrets:set SPOONACULAR_KEY</code>{' '}
          — you paste the value, Firebase encrypts and stores it.
        </li>
        <li>
          The function declares which secrets it needs:{' '}
          <code>onCall({`{ secrets: [SPOONACULAR_KEY] }`}, ...)</code>. At
          runtime, Firebase injects the secret as <code>SPOONACULAR_KEY.value()</code>.
        </li>
      </ul>
      <p>The key never appears in your code, never gets logged, never makes it into git history.</p>

      <h2>Deploying functions</h2>
      <pre><code>firebase deploy --only functions</code></pre>
      <p>
        Firebase packages the <code>functions/</code> folder, uploads it,
        Google Cloud Build builds a container, deploys it to Cloud Run, and
        flips the live alias. Takes a couple of minutes the first time.
      </p>

      <h2>The CORS gotcha — every new function needs an invoker grant</h2>
      <p>
        Firebase Functions Gen 2 run on Cloud Run. Cloud Run requires explicit
        permission for "allUsers" to invoke a function (a security default — by
        design, your function is private unless you say otherwise). The first
        time you deploy a new function, the browser will fail to call it with
        a CORS error <em>that's actually masking a 403</em>.
      </p>
      <p>The fix, run once per new function:</p>
      <pre><code>{`gcloud run services add-iam-policy-binding myfunctionname \\
  --member=allUsers --role=roles/run.invoker --region=us-central1`}</code></pre>
      <p>
        Note the service name is the lowercased function name. We've hit this
        every time we've added a new function (<code>searchTrustedSites</code>{' '}
        was the latest); HANDOFF.md has the snippet.
      </p>

      <h2>Watching logs</h2>
      <p>When a function misbehaves, the logs are in Firebase Console → Functions → Logs. Or from CLI:</p>
      <pre><code>firebase functions:log</code></pre>
      <p>The most common "huh, the function is broken" causes:</p>
      <ul>
        <li>Syntax error in <code>functions/index.js</code> that wasn't caught by node --check (see HANDOFF.md "Pre-deploy gotchas")</li>
        <li>A new secret wasn't set</li>
        <li>The invoker grant from above hasn't been applied</li>
        <li>The upstream API (Spoonacular, recipe sites) returned an unexpected response</li>
      </ul>

      <Quiz
        questions={[
          {
            q: "Why does the recipe import use a Cloud Function instead of just fetching the URL from the browser?",
            choices: [
              "Functions are faster than fetch()",
              "CORS — browsers can't fetch from external domains without permission. Functions can.",
              "Firebase requires it",
              "It's cheaper",
            ],
            correct: 1,
            explanation: "CORS is the structural reason. Browsers refuse cross-origin requests for security. Server-side code (Cloud Functions) doesn't have this restriction, so it can fetch any URL on the open internet.",
          },
          {
            q: "The Spoonacular API key isn't in functions/index.js or anywhere in git. Where is it?",
            choices: [
              "Hardcoded inside Firebase",
              "Google Secret Manager — encrypted at rest, injected into the function at runtime via SPOONACULAR_KEY.value()",
              "Stored in the user's browser",
              "It's a public key so it doesn't need protecting",
            ],
            correct: 1,
            explanation: "Secrets in code = bad. Secrets in a secret manager that the runtime reads = good. The function declares which secrets it needs; Firebase injects them at startup.",
          },
          {
            q: "You added a fifth function called sendDailyDigest, deployed it, and the browser gets a CORS error when calling it. The other four functions work fine. What did you forget?",
            choices: [
              "To restart your computer",
              "To grant allUsers the run.invoker role on the new function — Gen 2 functions are private by default",
              "To pay for the function",
              "To update HANDOFF.md",
            ],
            correct: 1,
            explanation: "Every new Gen 2 function needs the invoker grant, one time. The 'CORS error' the browser shows is actually masking a 403 from Cloud Run. gcloud run services add-iam-policy-binding sendDailyDigest --member=allUsers --role=roles/run.invoker --region=us-central1 fixes it.",
          },
          {
            q: "You change a line in functions/index.js, save the file, and... nothing happens in the deployed app. Why?",
            choices: [
              "Functions only re-deploy on Mondays",
              "Function code only runs on Google's servers. Local edits don't change the deployed version until you run firebase deploy --only functions.",
              "There's a 5-minute hot-reload delay",
              "You need to clear your browser cache",
            ],
            correct: 1,
            explanation: "Frontend code (under src/) has hot-reload via Vite. Functions are server code; you have to deploy them. There's a Firebase Emulator Suite that can run them locally for testing, but it's a separate setup we don't use.",
          },
        ]}
      />
    </>
  )
}
