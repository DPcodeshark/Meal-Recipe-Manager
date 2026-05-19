import Quiz from '../components/Quiz.jsx'

export default function RunningLocally() {
  return (
    <>
      <p className="lead">
        Time to actually get the app running on your machine. By the end of this
        lesson you should be looking at the Dinner App's login screen on{' '}
        <code>localhost:5173</code> — running your own copy, not the deployed
        one.
      </p>

      <h2>Step 1: Clone the repo</h2>
      <p>
        Open a terminal in whatever folder you want to keep the project in
        (Documents, or your home dir, or a dedicated <code>~/code/</code>{' '}
        folder). Then:
      </p>
      <pre><code>git clone https://github.com/DPcodeshark/Meal-Recipe-Manager.git
cd Meal-Recipe-Manager</code></pre>
      <p>
        Git creates a <code>Meal-Recipe-Manager</code> folder with the entire
        codebase + complete history. <code>cd</code> moves your terminal into
        that folder. <strong>Every command from here on assumes you're in that
        folder.</strong>
      </p>

      <h2>Step 2: Install the dependencies</h2>
      <pre><code>npm install</code></pre>
      <p>
        npm reads <code>package.json</code>, sees the list of libraries the
        project depends on (react, firebase, etc.), downloads them from the npm
        registry into a <code>node_modules/</code> folder, and records the
        exact versions in <code>package-lock.json</code>.
      </p>
      <p>
        First time this runs, it'll take 30–60 seconds and download ~200 MB.
        That folder is enormous because every package brings its own
        dependencies; it's normal. <code>node_modules/</code> is in{' '}
        <code>.gitignore</code> — never commit it.
      </p>
      <p>
        Also note: when you eventually want to work on the Cloud Functions, they
        have their own dependencies:
      </p>
      <pre><code>cd functions
npm install
cd ..</code></pre>
      <p>You only need to do that if you're going to edit or deploy the functions.</p>

      <h2>Step 3: Start the dev server</h2>
      <pre><code>npm run dev</code></pre>
      <p>This runs whatever's in <code>package.json</code>'s scripts under <code>"dev"</code>. For us that's <code>vite</code>. You'll see output like:</p>
      <pre><code>{`  VITE v8.0.13  ready in 412 ms

  ➜  Local:   http://localhost:5173/meals/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`}</code></pre>
      <p>
        Open that URL in your browser. You should see the Dinner App's PIN entry
        screen.
      </p>

      <h2>What "dev mode" actually does</h2>
      <p>Three things happen behind the scenes:</p>
      <ol>
        <li>
          <strong>Files are served as-is.</strong> Vite skips the
          bundling/minification step it does in production. Your JS modules are
          imported directly in the browser. This is why dev startup is fast.
        </li>
        <li>
          <strong>Hot module replacement (HMR).</strong> When you save a file,
          Vite figures out the smallest possible piece of the running app that
          needs to change and pushes <em>just that</em> to your browser — no
          page refresh, no losing state. Edit a CSS color, see it change in
          ~100ms.
        </li>
        <li>
          <strong>Source maps.</strong> When something breaks, the browser shows
          the error in your source code, not in the unrecognizable bundled
          output.
        </li>
      </ol>

      <h2>Demo mode (no Firebase needed)</h2>
      <p>
        The app needs Firebase credentials (an API key, a project ID, etc.) to
        talk to the real database. You don't have those — they're your uncle's.
        But the app is built to handle that gracefully.
      </p>
      <p>
        Open <code>src/firebase/config.js</code>:
      </p>
      <pre><code>{`export const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY`}</code></pre>
      <p>
        If the <code>VITE_FIREBASE_API_KEY</code> environment variable is
        missing (which it is, since you don't have a <code>.env</code> file),
        <code>isDemo</code> is <code>true</code>. Then look at{' '}
        <code>src/context/FamilyContext.jsx</code> — wherever it would normally
        read from Firestore, it falls back to the hardcoded{' '}
        <code>DEMO_FAMILY</code> object:
      </p>
      <pre><code>{`const DEMO_FAMILY = {
  id: 'demo-family',
  name: 'Our Family',
  pin: '1234',
  members: [
    { name: 'Erika', role: 'mom' },
    { name: 'Merrill', role: 'dad' },
    ...
  ],
}`}</code></pre>
      <p>
        So: enter PIN <code>1234</code> at the login screen, pick any avatar,
        and you're in. The data won't persist across browser refreshes (no
        database!) but you can click every button and see how every screen
        works.
      </p>

      <h2>Try it now</h2>
      <ol>
        <li>Login with PIN <code>1234</code>, pick a name.</li>
        <li>Open <code>src/pages/WeekView.jsx</code> in your editor.</li>
        <li>Search for the text <code>Meal Planner</code> (that's the page header).</li>
        <li>Change it to <code>Family Dinner Plan</code>, save the file.</li>
        <li>Watch your browser tab — the header changes <strong>instantly</strong>, no refresh needed.</li>
      </ol>
      <p>That feedback loop is the most addictive thing about modern web development. Use it.</p>

      <h2>Common gotchas</h2>
      <ul>
        <li>
          <strong>Port 5173 already in use</strong> — you have another Vite
          process running somewhere. Either close it or Vite will silently pick
          5174.
        </li>
        <li>
          <strong>"command not found: npm"</strong> — Node.js isn't installed
          or the terminal can't find it. Restart your terminal; if that doesn't
          work, reinstall Node.
        </li>
        <li>
          <strong>Hundreds of red errors during npm install</strong> — often a
          Node version mismatch. The project wants Node 22; check with{' '}
          <code>node --version</code>.
        </li>
        <li>
          <strong>"Permission denied" on npm install -g</strong> — you're on a
          Mac/Linux without proper npm prefix setup. Use{' '}
          <a href="https://github.com/nvm-sh/nvm" target="_blank" rel="noopener noreferrer">nvm</a> to manage Node versions per-user.
        </li>
      </ul>

      <h2>When you're done for the day</h2>
      <p>In your terminal where the dev server is running, hit <code>Ctrl+C</code> to stop it. Close the terminal. Next time you want to work, just <code>cd</code> back into the folder and <code>npm run dev</code> again.</p>

      <Quiz
        questions={[
          {
            q: "You ran npm install, it succeeded, but git status now shows a giant node_modules folder as 'untracked.' Should you commit it?",
            choices: [
              "Yes, your teammates need it",
              "No — node_modules is gigantic, machine-specific, and re-creatable from package.json. It's already in .gitignore.",
              "Only if it's smaller than 100 MB",
              "Yes, but only the package.json inside it",
            ],
            correct: 1,
            explanation: "node_modules is build output, not source. Everyone runs npm install themselves to recreate it. .gitignore keeps it out of the repo. Same logic for dist/ (build output) and .env (secrets).",
          },
          {
            q: "What's the magic that lets you change a file and see the browser update without a refresh?",
            choices: [
              "Browser extensions",
              "Vite's hot module replacement (HMR) — it pushes only the changed module to the running page",
              "A WebSocket to Firebase",
              "Manual page reload via JavaScript",
            ],
            correct: 1,
            explanation: "HMR is one of Vite's killer features. The dev server watches your files, and when one changes, it sends a tiny update through a WebSocket. The browser hot-swaps just that module, preserving everything else (form state, scroll position, etc.).",
          },
          {
            q: "You open the local app and the login screen appears — but you don't have a Firebase API key. How does login work?",
            choices: [
              "It doesn't; you need real credentials to log in",
              "Demo mode: isDemo is true because VITE_FIREBASE_API_KEY is missing, so the app uses a hardcoded DEMO_FAMILY with PIN 1234",
              "The app silently emails your uncle to ask for access",
              "You have to comment out the auth check",
            ],
            correct: 1,
            explanation: "Look at src/firebase/config.js and src/context/FamilyContext.jsx — the app deliberately handles the 'no credentials' case by falling back to demo data. PIN 1234, any avatar, you're in. No persistence, but every screen works.",
          },
          {
            q: "When you change a file in the functions/ folder while running npm run dev, does the change get applied?",
            choices: [
              "Yes, instantly — Vite watches everything",
              "No — Cloud Functions run on Google's servers, not locally. To test changes you'd deploy them or run the Firebase emulator.",
              "Only after npm install",
              "Only on Mondays",
            ],
            correct: 1,
            explanation: "The dev server only knows about the frontend (the React app in src/). The four Cloud Functions are server code; the deployed versions on Google's infrastructure are what your local frontend talks to. Editing functions/index.js doesn't change anything until you deploy them (or use the Firebase Emulator Suite for local testing, which we don't cover here).",
          },
        ]}
      />
    </>
  )
}
