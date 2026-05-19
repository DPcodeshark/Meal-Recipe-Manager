import Quiz from '../components/Quiz.jsx'

export default function Tools() {
  return (
    <>
      <p className="lead">
        Now that you know the shape of the app, let's get your machine set up to
        read and run it. None of this costs money. Most of it you'll install once
        and then forget about. Pace yourself — there's no rush to install
        everything in one sitting.
      </p>

      <h2>1. A code editor</h2>
      <h3>What's a code editor?</h3>
      <p>
        A <strong>code editor</strong> is just a text editor that knows it's
        looking at code. Like Word, but instead of formatting fonts, it colors
        keywords, indents your blocks, autocompletes function names, and gently
        tells you when you forgot a comma. You could technically write code in
        Notepad — people did for years — but a code editor turns hours of
        head-scratching into seconds.
      </p>
      <p>
        Modern editors also do things that go well beyond text:
      </p>
      <ul>
        <li>Show errors as you type (red squiggles, like spell-check)</li>
        <li>Jump from a function's name to where it's defined, in any file</li>
        <li>Run and debug code without leaving the editor</li>
        <li>Plug into version control (Git), test runners, AI assistants, etc.</li>
      </ul>

      <h3>Install VS Code</h3>
      <p>
        <strong>Visual Studio Code</strong> (usually just "VS Code") is the
        default code editor in 2026. It's free, made by Microsoft, runs on every
        OS, and has an extension for everything. Download from{' '}
        <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">code.visualstudio.com</a> and run the installer.
      </p>
      <p>
        After installing, launch it and you'll see a welcome page. Don't worry
        about customizing anything yet — the defaults are fine for now. We'll
        revisit settings when they actually matter.
      </p>

      <h3>Alternatives (FYI, not required)</h3>
      <p>
        Other editors people use happily: <strong>WebStorm</strong> (JetBrains, paid but great for JavaScript work), <strong>Cursor</strong> (a fork of VS Code with built-in AI), <strong>Sublime Text</strong>, <strong>Zed</strong>. The lessons assume nothing editor-specific, so use whichever feels right. If you don't have a strong preference, just use VS Code.
      </p>

      <h2>2. Node.js (the JavaScript runtime)</h2>
      <h3>What is Node?</h3>
      <p>
        JavaScript was originally invented to run inside web browsers. <strong>Node.js</strong> took that same JavaScript engine and packaged it as a program you can run from your command line — outside any browser. That means JavaScript can now do the things any "real" programming language does: read files, talk to databases, run web servers, install packages.
      </p>
      <p>
        Practically, you need Node for two things:
      </p>
      <ul>
        <li>To run the <strong>dev server</strong> (the thing that watches your code, rebuilds it, and serves it to your browser while you're working)</li>
        <li>To run <strong>npm</strong> — the package manager that downloads the libraries the project depends on (React, Firebase, etc.)</li>
      </ul>

      <h3>Install Node</h3>
      <p>
        Download the <strong>LTS</strong> (Long-Term Support) version from{' '}
        <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org</a>. As of writing that's Node 22.
      </p>
      <p>
        Verify by opening a terminal (Terminal.app on Mac, PowerShell or Command Prompt on Windows) and running:
      </p>
      <pre><code>node --version
npm --version</code></pre>
      <p>You should see numbers come back, like <code>v22.x.x</code> and <code>10.x.x</code>. If you see "command not found," the install didn't finish — try restarting your terminal.</p>

      <h2>3. Git (version control)</h2>
      <h3>What is Git?</h3>
      <p>
        Imagine if every time you saved a file, you also wrote down what
        changed, why, and who did it — and could rewind to any earlier version
        instantly. That's Git. It's the underlying machinery of GitHub, of
        almost every modern software project, and of every collaboration that
        involves more than one person touching the same code.
      </p>
      <p>
        You'll use Git's commands (<code>git clone</code>, <code>git commit</code>, <code>git push</code>) when you want to download the codebase, save your changes, and send them back to GitHub.
      </p>

      <h3>Install Git</h3>
      <p>
        Download from <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer">git-scm.com</a>. On Mac, you can also <code>brew install git</code> if you have Homebrew. On Windows, the installer is straightforward — accept all the defaults.
      </p>
      <p>Verify with:</p>
      <pre><code>git --version</code></pre>

      <h2>4. Claude (the AI pair-programmer)</h2>
      <p>
        Claude is the AI made by Anthropic — it's what your uncle used to build
        90% of this app, with him directing and reviewing. You'll get two flavors
        of Claude, because each is good at different things, and you'll switch
        between them.
      </p>

      <h3>4a. Claude desktop app (for asking questions)</h3>
      <p>
        The "chat" version of Claude — like ChatGPT, but Claude. Great for
        general questions: "explain what this code does," "what's a Firestore
        document?", "I'm stuck, how should I think about this?"
      </p>
      <p>
        Download from <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer">claude.ai/download</a>. Available for Mac, Windows, and there's also a browser version at <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">claude.ai</a> if you'd rather not install anything.
      </p>
      <p>
        You'll need an Anthropic account (sign in with Google works). The free
        tier is generous — enough for hours of chat per day.
      </p>

      <h3>4b. Claude Code (for working <em>in</em> the code)</h3>
      <p>
        Claude Code is a command-line tool that opens an interactive session{' '}
        <em>inside a project folder</em>. Unlike the desktop chat, it can read
        every file in your project, edit files, run commands, run tests, commit
        to Git — all by talking to it like you would a colleague. It's how this
        whole app was built.
      </p>
      <p>Install via npm (we'll have Node and npm by now, right?):</p>
      <pre><code>npm install -g @anthropic-ai/claude-code</code></pre>
      <p>Then in any project folder, run:</p>
      <pre><code>claude</code></pre>
      <p>
        It'll ask you to log in the first time (same Anthropic account as the
        desktop app), then you're in a conversation. Try{' '}
        <code>"explain what this app does"</code> and watch it read the
        codebase.
      </p>
      <p>
        <strong>When to use which?</strong> Use the <strong>desktop app</strong> to learn concepts, ask "what is X?" questions, or
        brainstorm. Use <strong>Claude Code</strong> when you want it to actually
        change the codebase — read files, write files, run a command for you.
        We'll go deeper on this distinction in a later lesson.
      </p>

      <h2>5. (Optional, for later) Cloud accounts</h2>
      <p>
        You don't need any of these to read the code, run it locally, or learn from it. They come into play if/when you want to deploy your own version, or hook up a real database to play with. We'll cover them in their respective lessons.
      </p>
      <ul>
        <li><strong>GitHub</strong> — sign up at <a href="https://github.com" target="_blank" rel="noopener noreferrer">github.com</a>. Free. Needed if you want to push code changes or fork the repo.</li>
        <li><strong>Firebase</strong> — sign in with any Google account at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a>. Needed only if you want to set up your own database to play with.</li>
        <li><strong>Firebase CLI + gcloud CLI</strong> — only needed if you're actually deploying. We'll install these in the Deploy lesson.</li>
      </ul>

      <h2>Sanity check</h2>
      <p>If you've installed Node and Git, this command sequence should clone the repo, install dependencies, and run the dev server:</p>
      <pre><code>git clone https://github.com/DPcodeshark/Meal-Recipe-Manager.git
cd Meal-Recipe-Manager
npm install
npm run dev</code></pre>
      <p>
        Look at the terminal output — there'll be a URL like{' '}
        <code>http://localhost:5173/meals/</code>. Open it in a browser. You
        should see the login screen. If you do, you're set up — the app is
        running on your laptop, just not connected to anyone's real database.
      </p>
      <p>
        Don't worry if you can't get past the login screen yet. We cover that
        ("demo mode") in a later lesson.
      </p>

      <Quiz
        questions={[
          {
            q: "What's the simplest accurate description of a code editor?",
            choices: [
              "A program that runs your code in the cloud",
              "A text editor that understands what code is and helps you write it (autocomplete, syntax highlighting, error checking)",
              "Microsoft Word with a black theme",
              "A graphical interface for using Git",
            ],
            correct: 1,
            explanation: "Code editors are text editors with code-specific superpowers. VS Code is the default in 2026 but any modern editor (WebStorm, Cursor, Zed, etc.) gives you the same essentials.",
          },
          {
            q: "Why do you need Node.js installed?",
            choices: [
              "To deploy the app to Firebase",
              "To run JavaScript outside the browser — specifically the dev server and npm (the package manager)",
              "Because Firebase requires it",
              "To compile React into HTML",
            ],
            correct: 1,
            explanation: "JavaScript started life as a browser-only language. Node lets you run it from the command line, which is what makes dev servers, build tools, npm, and Cloud Functions all possible.",
          },
          {
            q: "When should you reach for the Claude desktop app vs. Claude Code?",
            choices: [
              "Desktop for everything",
              "Claude Code for everything",
              "Desktop for asking questions or brainstorming. Claude Code when you want it to read/edit files in a specific project.",
              "Use whichever has more credits left",
            ],
            correct: 2,
            explanation: "Desktop = chat. Claude Code = teammate in your project folder, with file access and shell access. Different tools for different jobs.",
          },
          {
            q: "You typed npm install but you get 'npm: command not found.' Most likely cause?",
            choices: [
              "GitHub is down",
              "Node.js isn't installed yet (or your terminal needs a restart)",
              "You need an Anthropic API key",
              "Your code editor is broken",
            ],
            correct: 1,
            explanation: "npm comes bundled with Node.js. If the command isn't recognized, Node didn't finish installing OR the terminal you opened was started before the install added Node to your PATH. Closing and reopening the terminal usually fixes it.",
          },
        ]}
      />
    </>
  )
}
