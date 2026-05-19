import Quiz from '../components/Quiz.jsx'

export default function ClaudePart1() {
  return (
    <>
      <p className="lead">
        For the next two lessons, we shift from "how the app works" to "how to
        work with Claude." This stuff isn't taught in computer engineering
        classes yet, but it's a real skill — and the difference between someone
        who ships ten projects in a year and someone who ships one. Part 1:
        when to delegate, and how to ask.
      </p>

      <h2>The mental model</h2>
      <p>
        Claude (whether it's Claude Code in your terminal or the desktop app)
        is not a search engine, not autocomplete, and not a magic genie. The
        most useful way to think of Claude is as <strong>a fast, thorough,
        slightly over-eager junior developer</strong> who:
      </p>
      <ul>
        <li>Has read every public codebase, doc, and Stack Overflow answer up to its training cutoff</li>
        <li>Types at superhuman speed and never gets tired</li>
        <li>Will execute exactly what you ask — including bad ideas</li>
        <li>Sometimes invents facts confidently (more on this in part 2)</li>
        <li>Won't push back unless you've taught it to, or unless it's wildly wrong</li>
      </ul>
      <p>
        You are the senior on the pair. Your job is to direct, review, and
        catch the things Claude misses. Together, you'll move way faster than
        either of you could alone — but the "directing" part is non-optional.
      </p>

      <h2>When to delegate (and when to write yourself)</h2>
      <p>Two heuristics:</p>

      <h3>Delegate readily for:</h3>
      <ul>
        <li>
          <strong>Repetitive changes.</strong> "Rename all instances of X to Y across the codebase." Claude is incredible at this.
        </li>
        <li>
          <strong>Scaffolding.</strong> "Build me a settings form with these
          fields: name, PIN, theme picker." Faster to review Claude's first
          draft than to write it from scratch.
        </li>
        <li>
          <strong>Bug-fixing</strong> when you can describe the bug clearly.
          "The aisle picker doesn't close when you click outside. Add a
          click-outside handler."
        </li>
        <li>
          <strong>Boilerplate.</strong> Form handlers, fetch calls, validation
          logic, CRUD wiring — anything that's 80% pattern, 20% specifics.
        </li>
        <li>
          <strong>Unfamiliar territory.</strong> First time writing a service
          worker? First time using Firestore security rules? Claude has seen
          a thousand examples and can produce a working version faster than
          you can read the docs.
        </li>
      </ul>

      <h3>Write yourself (or at least direct heavily) for:</h3>
      <ul>
        <li>
          <strong>Architectural decisions.</strong> Should this be a Cloud
          Function or client-side? Should this data live in Firestore or local
          state? Claude can <em>discuss</em> these with you, but you should
          make the call.
        </li>
        <li>
          <strong>UI/UX choices with taste.</strong> Claude's defaults are
          competent but generic. "Make the day cards feel friendly" produces
          something OK; you describing what "friendly" looks like to{' '}
          <em>you</em> produces something great.
        </li>
        <li>
          <strong>Anything where the specification is unclear.</strong> If you
          can't describe what you want in words, Claude can't either. Stop and
          think first.
        </li>
        <li>
          <strong>Anything safety-sensitive.</strong> Auth flows, payment
          logic, anything that touches real money or PII. Claude can write the
          first draft; you have to review it carefully.
        </li>
      </ul>

      <h2>How to phrase a request well</h2>
      <p>Three rules:</p>

      <h3>1. Be specific about <em>what</em> and <em>where</em></h3>
      <p>Bad:</p>
      <pre><code>fix the bug</code></pre>
      <p>Better:</p>
      <pre><code>{`The aisle picker dropdown in src/pages/GroceryList.jsx doesn't close
when you click outside of it. Add a click-outside handler using a
useRef + a document mousedown listener pattern (we already use this in
Settings.jsx for the emoji picker — same approach).`}</code></pre>
      <p>
        The good version: names the file, describes the behavior precisely,
        and points at existing code to copy the pattern from. Claude can act
        immediately.
      </p>

      <h3>2. Give context for the why</h3>
      <p>Bad:</p>
      <pre><code>change the matching logic in findAisleFromMap to exact-match</code></pre>
      <p>Better:</p>
      <pre><code>{`The aisle-map fuzzy substring matching in findAisleFromMap is too
aggressive — setting aisle for "tomato" silently changes "tomato sauce"
and "cherry tomatoes" too. Users see this as a bug ("I changed one item
and another changed!"). Tighten it to exact-key match only. Acknowledge
that this loses some convenience (won't auto-apply across variants)
but the explicit-only behavior is much less surprising.`}</code></pre>
      <p>
        The good version explains why you want the change. Claude can now make
        sensible follow-up suggestions (like the comment about the trade-off)
        and avoid going beyond what you asked for.
      </p>

      <h3>3. Discuss before coding for non-trivial changes</h3>
      <p>
        For anything beyond a small tweak, ask Claude to <em>describe its
        approach</em> first, before generating code:
      </p>
      <pre><code>{`I want to add per-member ratings (thumbs up/down) to meals. Before
writing any code, describe how you'd structure the data model and
which files you'd touch.`}</code></pre>
      <p>
        Claude will lay out a plan. You review it, push back, refine. Then —
        and only then — say "ok, implement it." This saves you from sinking 20
        minutes reviewing a 200-line diff that took the wrong architectural
        turn at step 1.
      </p>

      <h2>The two-step pattern in practice</h2>
      <p>
        This is the single most useful workflow we developed building this
        app. It looks like:
      </p>
      <ol>
        <li>
          <strong>You describe the feature</strong> — high level, what it
          should do, where it shows up.
        </li>
        <li>
          <strong>Claude proposes an approach</strong> — data model, file
          changes, UX behavior, trade-offs.
        </li>
        <li>
          <strong>You push back / refine</strong> — "no, put it here instead";
          "skip the part about X for now"; "I'd rather it be a button than a
          modal."
        </li>
        <li>
          <strong>Claude implements</strong> — typically in a single message
          with multiple file edits.
        </li>
        <li>
          <strong>You review the diff</strong> — read every change carefully,
          ask "why did you do X?" if anything looks weird.
        </li>
        <li>
          <strong>Test and iterate</strong> — run the app, find the rough
          edges, send a follow-up prompt.
        </li>
      </ol>
      <p>
        Steps 1-3 take maybe 2 minutes. Step 4 takes Claude a few seconds. The
        whole loop is ~5 minutes for a non-trivial feature. <strong>The bottleneck
        is your clarity, not Claude's speed.</strong>
      </p>

      <h2>One more habit: use todos for multi-step work</h2>
      <p>
        Claude Code has a built-in todo list it can use to track multi-step
        tasks. For anything with 3+ discrete pieces, ask Claude to set up a
        todo list and check items off as it goes. It both keeps Claude
        focused and gives you a checkpoint to interrupt if you want to redirect.
      </p>

      <Quiz
        questions={[
          {
            q: "What's the best mental model for Claude when you're working on code?",
            choices: [
              "A genius that doesn't need oversight",
              "An autocomplete that finishes the sentence you're typing",
              "A fast, thorough, slightly over-eager junior developer who needs clear direction and careful review",
              "A search engine",
            ],
            correct: 2,
            explanation: "The 'junior developer' framing is the one that makes Claude actually useful. It works fast, it knows a lot, and it'll execute bad ideas without complaint unless you direct it well. You're the senior on the pair.",
          },
          {
            q: "You're about to ask Claude to add a 'meal photo upload' feature. What should you do first?",
            choices: [
              "Just say 'add photo upload' and let it figure out the rest",
              "Ask Claude to describe its approach (data model, files to change, UX flow) before writing any code, so you can review and redirect before the implementation",
              "Write the whole thing yourself, then have Claude review",
              "Open a GitHub issue and assign it to Claude",
            ],
            correct: 1,
            explanation: "The two-step pattern (discuss approach → implement) is the single most useful workflow for non-trivial changes. A 2-minute conversation about the plan saves you 20 minutes reviewing a diff that went the wrong direction.",
          },
          {
            q: "Which of these is the WORST kind of task to delegate to Claude?",
            choices: [
              "Renaming a variable across 30 files",
              "Writing a Firestore security rules file from scratch",
              "Deciding whether the meal-rating feature should be stored per-meal or in a separate ratings collection",
              "Adding boilerplate validation to a form",
            ],
            correct: 2,
            explanation: "The architectural decision is yours. Claude can lay out trade-offs, but you have to weigh them against the actual product needs (which Claude doesn't fully know). The other three are great delegation candidates.",
          },
          {
            q: "Compare these two prompts:\n\n(A) 'fix the search bar'\n(B) 'In src/pages/MealLibrary.jsx the search input is missing a clear button. When there's text in the field, show an X on the right side that clears the query when clicked. Match the pattern we use in WeekView.jsx for the sidebar search.'\n\nWhich is better and why?",
            choices: [
              "(A) — Claude figures things out, no need to over-specify",
              "(B) — it names the file, describes the exact behavior, AND points at an existing pattern to match. Claude can act immediately with no follow-up questions.",
              "Same quality",
              "(A) is better for fast iteration",
            ],
            correct: 1,
            explanation: "Specificity is kindness. (A) forces Claude to guess (and probably ask clarifying questions, slowing you down). (B) gives it everything it needs: the where, the what, and a pattern to mimic. You'll get a useful diff on the first try.",
          },
        ]}
      />
    </>
  )
}
