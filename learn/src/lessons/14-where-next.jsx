import Quiz from '../components/Quiz.jsx'

export default function WhereNext() {
  return (
    <>
      <p className="lead">
        You've got the map of this app and the stack it's built on. The
        real growth comes from <em>using</em> it — building things, breaking
        things, fixing things. Here's where to go from here.
      </p>

      <h2>Build something of your own</h2>
      <p>
        The single fastest way to internalize all of this is to start a new
        project from scratch. Not a clone of this one — something <em>you</em>{' '}
        want. A project that you'll actually use:
      </p>
      <ul>
        <li>A workout tracker that syncs across your phone and laptop</li>
        <li>A study tool for whatever class is kicking your butt this semester</li>
        <li>A bracket-style poll for your friend group to settle arguments</li>
        <li>A weekly habit tracker with reminders</li>
        <li>A shared note-taking app for a study group</li>
        <li>A game-night score keeper</li>
      </ul>
      <p>
        The trick is to pick something <strong>specific and small</strong>.
        "A Twitter clone" is too big. "An app to track which board games
        we've played and rate them" is great — you can ship a v1 in an
        afternoon.
      </p>
      <p>
        Use the same stack: React + Vite + Firebase. You already know the
        shape; reusing the patterns means more brainpower available for the
        actual problem.
      </p>

      <h2>Things to add to this app</h2>
      <p>
        If you want to keep working in this codebase first, here are
        legitimately useful things that aren't built yet. Each is a great
        learning exercise:
      </p>
      <ul>
        <li>
          <strong>Per-week grocery lists.</strong> Right now there's one
          shared grocery state for all weeks; add the ability to view this
          week vs. next week. Touches: data model design, UI state.
        </li>
        <li>
          <strong>"Haven't cooked in X weeks" surfacing</strong> in the
          planner sidebar. Touches: derived data, sort logic.
        </li>
        <li>
          <strong>Dietary cross-reference at meal assignment</strong> — warn
          if a planned meal contains a flagged ingredient (Merrill is allergic
          to chicken; warn before he's the assigned cook for chicken
          marsala). Touches: ingredient matching, member data, gentle UX.
        </li>
        <li>
          <strong>Cooking mode</strong> — when you tap a planned meal on the
          day of, get a clean reader view of ingredients + steps, no nav. For
          phone-propped-in-kitchen use. Touches: new route, layout work,
          maybe a Wake Lock API call.
        </li>
        <li>
          <strong>Touch drag-and-drop on mobile.</strong> Current DnD is HTML5
          native (desktop only). Add <code>@dnd-kit/core</code> to support
          touch. Touches: library evaluation, replacing existing behavior.
        </li>
      </ul>
      <p>
        All are listed in HANDOFF.md under "Future Ideas." Pick one. Ship it.
        Update HANDOFF.md when you're done.
      </p>

      <h2>Things worth deepening</h2>

      <h3>JavaScript itself</h3>
      <p>
        Modern JS has a lot of small but important features (destructuring,
        optional chaining, async/await, modules). If any of these
        consistently confuse you when reading the code, take half a day on{' '}
        <a href="https://javascript.info/" target="_blank" rel="noopener noreferrer">javascript.info</a> —
        the best free reference around.
      </p>

      <h3>React fundamentals</h3>
      <p>
        Read <a href="https://react.dev/learn" target="_blank" rel="noopener noreferrer">react.dev/learn</a>{' '}
        front to back when you have a couple of hours. Cover hooks, state
        management, effects. It'll make this codebase make twice as much
        sense.
      </p>

      <h3>TypeScript</h3>
      <p>
        This app is plain JavaScript. The next one you build, consider
        TypeScript. It's JavaScript with type annotations — catches a
        whole class of bugs at edit-time instead of run-time. Once you've
        used it for a project you won't want to go back.
      </p>

      <h3>Tests</h3>
      <p>
        We have approximately zero tests. For a 5-person family tool this
        is fine; for anything growing beyond hobby scale, tests start
        paying for themselves. Look at <strong>Vitest</strong> (the Vite-native
        test runner) and <strong>React Testing Library</strong> when you're
        ready.
      </p>

      <h3>Web fundamentals (MDN)</h3>
      <p>
        Every time you wonder "wait, what does this HTML/CSS/JS thing
        actually do?" — go to <a href="https://developer.mozilla.org/" target="_blank" rel="noopener noreferrer">developer.mozilla.org</a>{' '}
        (MDN). It's the canonical web reference. No fluff, no ads, just docs.
      </p>

      <h2>Things to learn about Claude (and AI tools generally)</h2>

      <h3>Other Claude integrations</h3>
      <p>
        Claude Code is the terminal version. There's also:
      </p>
      <ul>
        <li>The Claude desktop app for everyday chat</li>
        <li><strong>Claude in VS Code</strong> / JetBrains extensions — runs alongside your editor</li>
        <li>The <strong>Anthropic API</strong> — if you want to build features that call Claude programmatically (a chatbot, a summarizer, etc.)</li>
      </ul>

      <h3>Other AI coding tools</h3>
      <p>
        Try the alternatives. <strong>Cursor</strong> is a VS Code fork with
        AI deeply integrated. <strong>GitHub Copilot</strong> is the
        autocomplete-style version. <strong>Codeium</strong>, <strong>Cody</strong>,{' '}
        <strong>Continue.dev</strong> all have their own takes. Different
        tools suit different workflows. The skill is being good at the
        workflow, not loyal to one tool.
      </p>

      <h3>Read other people's Claude conversations</h3>
      <p>
        The most direct way to get better at working with Claude is watching
        someone good at it. Anthropic publishes prompt engineering guides;
        there are streams and blog posts of people pair-programming with
        Claude. Reverse-engineer their habits.
      </p>

      <h2>Communities</h2>
      <ul>
        <li>
          <strong>Reddit</strong> — <code>r/webdev</code>, <code>r/reactjs</code>,{' '}
          <code>r/Firebase</code>, <code>r/ClaudeAI</code>
        </li>
        <li>
          <strong>Discord servers</strong> for the libraries you use (React,
          Firebase, etc.) — usually a #help channel where you can drop a
          question and get an answer in minutes
        </li>
        <li>
          <strong>Stack Overflow</strong> — still useful as a search target,
          even though Claude can answer most things faster
        </li>
        <li>
          <strong>X/Twitter</strong> — the JavaScript/AI dev community is
          unusually active here; follow people whose work you like
        </li>
      </ul>

      <h2>The most underrated habit</h2>
      <p>
        Read other people's code. A lot of it. Open random repos on GitHub
        and skim them. You'll see patterns you'd never have invented yourself,
        techniques that solve problems you didn't know you had, and bad code
        that calibrates your own taste. Reading code is to writing code what
        reading novels is to writing them — non-negotiable if you want to be
        any good.
      </p>

      <h2>One last thing</h2>
      <p>
        The biggest difference between people who become great engineers and
        people who don't isn't talent. It's the number of finished projects
        on their hard drive. Ship things. Even when they're rough. Especially
        when they're rough. Your tenth project will be better than your first
        because you finished the first nine.
      </p>
      <p>
        You have all the tools now. Go build something. Update HANDOFF.md
        when you do. Your uncle will be proud.
      </p>

      <Quiz
        questions={[
          {
            q: "You want to keep learning. What's the highest-leverage next step?",
            choices: [
              "Read three more programming books before writing any code",
              "Start a small new project of your own — something specific you'd actually use — and ship a v1",
              "Take an expensive online course",
              "Wait until you feel 'ready'",
            ],
            correct: 1,
            explanation: "Shipping > studying. The fastest way to internalize this stack is to use it for something you care about. A small finished thing teaches you more than a large half-built thing or any amount of reading.",
          },
          {
            q: "When sizing your first solo project, what should you aim for?",
            choices: [
              "The biggest, most ambitious idea you have",
              "Something specific, small, and personally useful — 'app to track board games we've played' beats 'social network for board gamers'",
              "A perfect clone of an existing popular product",
              "Whatever pays the most",
            ],
            correct: 1,
            explanation: "Small + specific + personally useful = finishable. Finishable = you actually learn. Ambitious projects that never ship teach you almost nothing.",
          },
          {
            q: "Which of these is the single most underrated habit for becoming a better engineer?",
            choices: [
              "Memorizing syntax",
              "Reading lots of other people's code — random repos, library source, anything well-written",
              "Watching tutorial videos at 2× speed",
              "Always using the newest framework",
            ],
            correct: 1,
            explanation: "Code-reading calibrates your taste, teaches you patterns you wouldn't have invented, and shows you bad code that helps you avoid the same mistakes. It's to writing code what reading novels is to writing them.",
          },
        ]}
      />
    </>
  )
}
