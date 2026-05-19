import Quiz from '../components/Quiz.jsx'

export default function Tools() {
  return (
    <>
      <p className="lead">
        Before any code: get the right tools on your machine. None of this costs
        money. Most of it you'll only install once and then forget about.
      </p>

      <h2>The non-negotiables</h2>

      <h3>Node.js (and npm)</h3>
      <p>
        <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a> is
        a JavaScript runtime. It's what lets you run JS outside a browser — for
        the dev server, the build, the deploy scripts. <code>npm</code> comes with
        it; that's the package manager (think: pip for Python).
      </p>
      <p>
        Install the <strong>LTS</strong> (long-term support) version. Verify with:
      </p>
      <pre><code>node --version
npm --version</code></pre>
      <p>You should see something like <code>v22.x.x</code> for Node.</p>

      <h3>Git</h3>
      <p>
        Version control. Tracks every change to the code, lets multiple people
        work on the same project, and is what GitHub speaks. Install from{' '}
        <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer">git-scm.com</a>{' '}
        or via Homebrew on Mac (<code>brew install git</code>) or Chocolatey on
        Windows.
      </p>

      <h3>A code editor</h3>
      <p>
        <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">VS Code</a> is
        the default these days — free, fast, has every extension you'll want.
        JetBrains products (WebStorm) are great too if you're already in that
        ecosystem. The lessons assume nothing editor-specific.
      </p>

      <h3>Claude Code</h3>
      <p>
        The CLI that turns Claude into your pair-programmer. Install via:
      </p>
      <pre><code>npm install -g @anthropic-ai/claude-code</code></pre>
      <p>
        Then <code>claude</code> from inside any project directory opens an
        interactive session. There are integrations for VS Code and JetBrains too
        — install whichever fits your editor.
      </p>

      <h2>The cloud accounts (free tier)</h2>

      <h3>GitHub</h3>
      <p>
        Where the code lives publicly. The app's repo is at{' '}
        <a href="https://github.com/DPcodeshark/Meal-Recipe-Manager" target="_blank" rel="noopener noreferrer">DPcodeshark/Meal-Recipe-Manager</a>.
        Sign up at <a href="https://github.com" target="_blank" rel="noopener noreferrer">github.com</a> if you don't have an account.
      </p>

      <h3>Google account → Firebase</h3>
      <p>
        Firebase is Google's "backend as a service" — it runs the database, the
        authentication, the file hosting, and the serverless functions. The app
        uses <strong>all four</strong>. Sign in to{' '}
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a>{' '}
        with any Google account.
      </p>
      <p>
        To deploy from your terminal, install the Firebase CLI:
      </p>
      <pre><code>npm install -g firebase-tools
firebase login</code></pre>

      <h3>(Optional) Google Cloud SDK</h3>
      <p>
        Firebase's "functions" live on Google Cloud Run, and a few admin
        operations (like granting public access to a new function) use the{' '}
        <code>gcloud</code> CLI. Install from{' '}
        <a href="https://cloud.google.com/sdk/docs/install" target="_blank" rel="noopener noreferrer">cloud.google.com/sdk</a>{' '}
        if/when a lesson asks for it. You can skip until then.
      </p>

      <h2>Quick sanity check</h2>
      <p>
        Once you have Node and Git installed, this command sequence should clone
        the repo, install dependencies, and run the dev server:
      </p>
      <pre><code>git clone https://github.com/DPcodeshark/Meal-Recipe-Manager.git
cd Meal-Recipe-Manager
npm install
npm run dev</code></pre>
      <p>
        You'll see a localhost URL in your terminal. Open it — you should see the
        login screen. If you do, you're set up. (Without the Firebase config
        environment variables, the app runs in "demo mode" and won't actually
        save anything to a real database — that's fine for poking around.)
      </p>

      <Quiz
        questions={[
          {
            q: "What does npm install -g do?",
            choices: [
              "Installs a package globally on your machine (available everywhere)",
              "Installs only inside the current project",
              "Uploads your code to GitHub",
              "Compiles JavaScript to a binary",
            ],
            correct: 0,
            explanation: "The -g flag means 'global' — the package is installed once and any project can use it. We use it for tools like firebase-tools and Claude Code that are CLIs, not project dependencies.",
          },
          {
            q: "Which of these does Firebase NOT do for this app?",
            choices: [
              "Host the static frontend files",
              "Store data in Firestore",
              "Run serverless Cloud Functions",
              "Send physical mail to your house",
            ],
            correct: 3,
            explanation: "Firebase covers hosting, database, auth, and functions — the four pillars of this app's backend. It does not, however, send physical mail.",
          },
          {
            q: "If you just want to read the code and poke at the UI without setting anything up, what's the fastest path?",
            choices: [
              "Pay $99 for an Apple Developer account",
              "Apply for a Google Cloud research grant",
              "Clone the repo, run npm install + npm run dev, ignore the env vars (demo mode)",
              "Wait for the next office hours",
            ],
            correct: 2,
            explanation: "The app is built to fall back to a demo mode when Firebase isn't configured — so for read-only exploration you don't need any accounts. Just clone, install, run.",
          },
        ]}
      />
    </>
  )
}
