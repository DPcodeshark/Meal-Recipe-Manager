import Quiz from '../components/Quiz.jsx'

export default function Stack() {
  return (
    <>
      <p className="lead">
        You've seen the five-piece architecture (lesson 02) and the folder layout
        (lesson 04). Now: what are the actual libraries we're using, why
        these and not others, and which ones you'll touch most often.
      </p>

      <h2>The short answer</h2>
      <p>Open <code>package.json</code> in the repo. The <code>dependencies</code> block has the libraries we ship:</p>
      <pre><code>{`"dependencies": {
  "react": "^19.x",
  "react-dom": "^19.x",
  "react-router-dom": "^7.x",
  "firebase": "^12.x",
  "date-fns": "^4.x",
  "lucide-react": "^1.x",
  "vite-plugin-pwa": "^1.x"
}`}</code></pre>
      <p>That's the entire frontend stack. Let's go through them.</p>

      <h2>React (the UI framework)</h2>
      <p>
        React is the library that turns "data + a function" into pixels on the
        screen. The whole app is made of <strong>components</strong> — JavaScript
        functions that return JSX (HTML-like syntax). When the data changes,
        React re-runs the function and updates only the parts of the screen
        that actually changed.
      </p>
      <p>
        Why React in 2026: it's the default. Every job, every tutorial, every
        Stack Overflow answer assumes React unless told otherwise. The team that
        learned it 5 years ago and the team that joined yesterday speak the same
        language. <strong>Defaults have value</strong> — boring stack choices
        free up your brain for interesting problems.
      </p>
      <p>
        Alternatives you'll hear about: <strong>Vue</strong>, <strong>Svelte</strong>,
        <strong> Solid</strong>. All fine. None worth switching for unless you have
        a specific reason.
      </p>

      <h2>Vite (the build tool)</h2>
      <p>
        Browsers can't actually run JSX or TypeScript or modern JavaScript module
        imports without help. <strong>Vite</strong> is the program that:
      </p>
      <ul>
        <li>Runs the dev server (<code>npm run dev</code>) — when you save a file, it pushes the change to your browser in milliseconds</li>
        <li>Bundles everything for production (<code>npm run build</code>) — turns ~2000 source files into ~3 minified files in <code>dist/</code></li>
        <li>Handles the asset pipeline (CSS imports, images, JSON, etc.)</li>
      </ul>
      <p>
        Vite's two ancestors are <strong>Webpack</strong> and <strong>Parcel</strong>.
        Vite won because it's faster (uses native ES modules in dev, skips bundling) and has saner defaults.
      </p>
      <p>
        You'll rarely edit <code>vite.config.js</code> directly. The most common
        reasons: change the <code>base</code> path, add a plugin (like
        vite-plugin-pwa), or tweak the output directory. We do all three.
      </p>

      <h2>react-router-dom (page routing)</h2>
      <p>
        The Dinner App is a <strong>single-page app</strong>: the browser loads
        one HTML file, then JavaScript swaps content in and out based on the URL.
        That URL-swapping is what router-dom does. Each tab in the bottom
        navigation maps to a route:
      </p>
      <pre><code>{`/meals/          → WeekView (the planner)
/meals/meals     → MealLibrary
/meals/grocery   → GroceryList
/meals/pantry    → Pantry
/meals/settings  → Settings`}</code></pre>
      <p>
        Look at <code>src/App.jsx</code> — that's where all the routes are
        wired up using <code>{`<Routes>`}</code> and <code>{`<Route>`}</code>{' '}
        components.
      </p>

      <h2>firebase (the SDK for everything Google)</h2>
      <p>
        The Firebase JavaScript SDK is one npm package that bundles auth,
        Firestore, Cloud Functions client, hosting metadata, etc. We use four
        modules from it:
      </p>
      <ul>
        <li><code>firebase/app</code> — initialize the connection</li>
        <li><code>firebase/firestore</code> — read/write the database</li>
        <li><code>firebase/auth</code> — anonymous sign-in</li>
        <li><code>firebase/functions</code> — call our Cloud Functions</li>
      </ul>
      <p>
        Open <code>src/firebase/config.js</code> for the wiring. Everywhere in
        the app, you'll see imports like <code>{`import { onSnapshot } from 'firebase/firestore'`}</code> —
        that's this SDK in action.
      </p>

      <h2>The small but useful ones</h2>

      <h3>date-fns</h3>
      <p>
        Working with dates in raw JavaScript is famously painful. <code>date-fns</code> is
        a library of tiny date functions: <code>addDays</code>, <code>format</code>,
        <code>differenceInDays</code>, etc. We use it for week-id arithmetic in{' '}
        <code>src/utils/dates.js</code>.
      </p>

      <h3>lucide-react</h3>
      <p>
        The icon set. Every <code>{`<Plus>`}</code>, <code>{`<X>`}</code>,
        <code>{`<ChevronDown>`}</code> in the app comes from here. Free, open
        source, looks clean, has thousands of icons. Search at <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">lucide.dev</a>.
      </p>

      <h3>vite-plugin-pwa</h3>
      <p>
        Turns the app into a Progressive Web App — adds the manifest, generates
        a service worker, makes "Add to Home Screen" work on phones. Wired up in{' '}
        <code>vite.config.js</code>. We'll cover what a PWA actually is in
        lesson 10.
      </p>

      <h2>Where to look first</h2>
      <p>
        If you only have time to read <strong>one library's docs</strong>, make it
        React's: <a href="https://react.dev/learn" target="_blank" rel="noopener noreferrer">react.dev/learn</a>. The "Quick Start" alone gives you
        everything you need to understand 80% of this codebase. The rest you can
        learn by doing.
      </p>

      <Quiz
        questions={[
          {
            q: "What's the practical difference between npm run dev and npm run build?",
            choices: [
              "Both do the same thing; the names are aliases",
              "dev starts a local dev server that hot-reloads on save; build produces optimized files in dist/ for production",
              "dev runs your tests; build deploys to Firebase",
              "dev uses Vite; build uses Webpack",
            ],
            correct: 1,
            explanation: "dev = work mode (fast, watches files, sends live updates to your browser). build = ship mode (slower, produces the compact files you upload to Firebase). They're different stages of the same pipeline.",
          },
          {
            q: "What does react-router-dom do?",
            choices: [
              "Talks to Firestore",
              "Routes incoming HTTP requests on a Node.js server",
              "Maps URL paths to React components so /meals/grocery shows the GroceryList page",
              "Compiles JSX to JavaScript",
            ],
            correct: 2,
            explanation: "It's the client-side router. The browser only ever loads one HTML file from Firebase; react-router watches the URL and swaps which component is shown without a full page reload.",
          },
          {
            q: "Why did we pick React + Vite + Firebase over fancier alternatives?",
            choices: [
              "They're objectively the best technologies",
              "They're well-supported defaults — boring stack choices free your brain for interesting problems, and Claude knows them deeply",
              "Anthropic recommended them",
              "They're the cheapest combination",
            ],
            correct: 1,
            explanation: "There's no objectively best stack. The win of React + Vite + Firebase is that they're the path of least resistance: massive community, mature docs, every AI assistant knows them inside out. Save your novelty budget for the parts of your app that are actually novel.",
          },
        ]}
      />
    </>
  )
}
