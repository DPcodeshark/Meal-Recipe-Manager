import Quiz from '../components/Quiz.jsx'

export default function Codebase() {
  return (
    <>
      <p className="lead">
        Open the repo in another tab while you read this:{' '}
        <a href="https://github.com/DPcodeshark/Meal-Recipe-Manager" target="_blank" rel="noopener noreferrer">github.com/DPcodeshark/Meal-Recipe-Manager</a>.
        We're going to walk through what each top-level folder is for and which
        files matter most.
      </p>

      <figure className="screenshot">
        <img src="/learn/github-tree.png" alt="GitHub view of the Meal-Recipe-Manager repository showing top-level folders (functions, landing, learn, public, scripts, src) and files (.env.example, .firebaserc, .gitignore, HANDOFF.md, INSTALL.md, README.md, eslint.config.js). Each row shows its most recent commit message and timestamp. The repo is marked Public; the most recent commit is by 'Dinner App and claude'." />
        <figcaption>
          What the repo looks like on GitHub. Two things worth noticing:
          (1) every row shows the most recent commit that touched that file
          or folder — handy for "when did X last change?" without leaving
          the page. (2) The "Dinner App and claude" co-author on recent
          commits is the signature of a Claude Code commit. You'll see lots
          of those in the history.
        </figcaption>
      </figure>

      <h2>The shape of the repo</h2>
      <pre><code>{`Meal-Recipe-Manager/
├── src/              ← The Dinner App (React, /meals)
├── functions/        ← Cloud Functions (Node.js backend)
├── landing/          ← The zavods.com homepage (plain HTML)
├── learn/            ← This learning site (React, /learn)
├── public/           ← Static assets (icons, favicon)
├── scripts/          ← Build helpers
├── HANDOFF.md        ← The actual reference doc (read this!)
├── INSTALL.md        ← How to install the app on a phone
├── package.json      ← Dependencies + npm scripts
├── vite.config.js    ← Build config for the Dinner App
├── vite.learn.config.js  ← Build config for this learning site
└── firebase.json     ← Hosting + functions deploy config`}</code></pre>

      <h2>What lives where</h2>

      <h3>src/ — the Dinner App itself</h3>
      <p>
        This is the React app that runs at <code>zavods.com/meals</code>. Three
        sub-folders matter most:
      </p>
      <ul>
        <li>
          <code>src/pages/</code> — one file per tab in the bottom navigation.{' '}
          <code>WeekView.jsx</code> is the meal planner, <code>MealLibrary.jsx</code>{' '}
          is the recipe library, etc. Each is a self-contained chunk of UI.
        </li>
        <li>
          <code>src/components/</code> — shared building blocks. Right now just
          the bottom navigation bar and a little helper.
        </li>
        <li>
          <code>src/context/FamilyContext.jsx</code> — the central piece of glue
          that loads the family's data from Firebase and makes it available to
          every page. This file is worth reading in full when you have 10 minutes.
        </li>
      </ul>
      <p>
        And the two top-level files in <code>src/</code>:
      </p>
      <ul>
        <li><code>src/App.jsx</code> — sets up routes, decides what to render based on the URL.</li>
        <li><code>src/App.css</code> — every style for the entire app. ~1700 lines, but organized by section.</li>
      </ul>

      <h3>functions/ — the backend</h3>
      <p>
        Four small functions that do things the browser can't safely do — like
        scraping recipe sites or calling the Spoonacular API with a private key.
        It's all one file: <code>functions/index.js</code>. We'll dig into when
        you'd reach for a Cloud Function in a later lesson.
      </p>

      <h3>landing/ — the front door</h3>
      <p>
        <code>zavods.com</code> serves a single hand-written HTML file. No React,
        no build step, no framework. Just an <code>{`<h1>`}</code>, a paragraph, and
        a button to the Dinner App. <strong>This is on purpose</strong>: when a
        page is this simple, framework overhead is pure cost. Knowing when NOT to
        reach for React is a skill.
      </p>

      <h3>learn/ — this site you're reading right now</h3>
      <p>
        Same shape as the Dinner App (a React+Vite project), but smaller and
        focused on content. Each lesson is its own JSX file in{' '}
        <code>learn/src/lessons/</code>. The fact that you're reading this lesson
        means we successfully wrote a JSX file, put it in that folder, registered
        it in <code>learn/src/lessons/index.js</code>, and deployed.
      </p>

      <h2>The "running it" files</h2>
      <p>You don't have to memorize these. Just know they exist and what they do:</p>
      <ul>
        <li><code>package.json</code> — lists every library the project depends on and defines the npm scripts (<code>npm run dev</code>, <code>npm run build</code>, etc.)</li>
        <li><code>vite.config.js</code> — tells Vite how to build the Dinner App. Things like "put the assets under /meals/" and "make it a PWA" live here.</li>
        <li><code>firebase.json</code> — tells Firebase Hosting what to serve and how to route requests. <strong>This is also where the Node version for Cloud Functions is pinned.</strong></li>
        <li><code>HANDOFF.md</code> — the reference doc your uncle keeps current. When something seems weird, search HANDOFF first.</li>
      </ul>

      <h2>How to navigate it efficiently</h2>
      <p>
        Two tricks for any unfamiliar codebase:
      </p>
      <ol>
        <li>
          <strong>Find the entry point.</strong> Trace from <code>index.html</code> →{' '}
          <code>main.jsx</code> → <code>App.jsx</code>. That gives you the
          backbone in 60 seconds.
        </li>
        <li>
          <strong>Search by behavior.</strong> Want to know how grocery items get
          aisle assignments? Open VS Code's search, type <code>"aisle"</code>,
          start with the file that has the most hits.
        </li>
      </ol>

      <h2>Try it</h2>
      <p>
        Open <code>src/pages/WeekView.jsx</code> in the repo on GitHub (or in
        your local clone). Skim it top to bottom — don't try to understand
        everything, just get a feel for its shape:
      </p>
      <ul>
        <li>It's a single React function component.</li>
        <li>The top is state hooks (<code>useState</code>) and effects (<code>useEffect</code>).</li>
        <li>The bottom is one big JSX <code>return (...)</code> that builds the planner UI.</li>
      </ul>
      <p>
        That's the pattern for every page in <code>src/pages/</code>. Once you
        recognize the shape, the rest of the codebase stops feeling foreign.
      </p>

      <Quiz
        questions={[
          {
            q: "If you wanted to change how a day on the meal planner looks, which file would you open first?",
            choices: [
              "functions/index.js",
              "src/pages/WeekView.jsx",
              "landing/index.html",
              "vite.config.js",
            ],
            correct: 1,
            explanation: "src/pages/ has one file per tab. WeekView.jsx is the meal planner.",
          },
          {
            q: "Why is landing/ just plain HTML instead of a React app?",
            choices: [
              "We ran out of time to convert it",
              "React doesn't work for static pages",
              "Knowing when NOT to reach for a framework keeps things simple and fast",
              "Firebase Hosting doesn't support React",
            ],
            correct: 2,
            explanation: "For a single-page front door with no interactivity, plain HTML is shorter, faster to load, and easier to edit than a React build. Right-sizing tools is a real skill.",
          },
          {
            q: "Where does the central 'load the family's data and share it with every page' code live?",
            choices: [
              "src/App.css",
              "src/components/NavBar.jsx",
              "src/context/FamilyContext.jsx",
              "functions/index.js",
            ],
            correct: 2,
            explanation: "FamilyContext.jsx uses React Context to load family data once and expose it to every page via the useFamily() hook. This is the heart of the app's data flow.",
          },
          {
            q: "You don't recognize a folder or file. What's the first thing to check?",
            choices: [
              "Delete it and see if anything breaks",
              "Search HANDOFF.md for its name",
              "Email your uncle",
              "Rewrite it from scratch",
            ],
            correct: 1,
            explanation: "HANDOFF.md is the running reference doc — kept current by your uncle. When you're confused, search there before anywhere else. (And no, never just delete files to see what happens.)",
          },
        ]}
      />
    </>
  )
}
