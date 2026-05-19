import Quiz from '../components/Quiz.jsx'

export default function ClaudePart2() {
  return (
    <>
      <p className="lead">
        Last lesson was about asking. This lesson is about what to do{' '}
        <em>after</em> Claude responds — reading diffs, pushing back, knowing
        when Claude is wrong, and iterating. The skill that separates good
        Claude collaborators from bad ones is mostly here.
      </p>

      <h2>Read every diff carefully</h2>
      <p>
        Claude Code shows you a diff for every file it modifies. <strong>Read
        them.</strong> Don't just hit "yes, continue." Three things to look for
        every time:
      </p>

      <h3>1. Scope creep</h3>
      <p>
        You asked Claude to "fix the click-outside on the aisle picker."
        Claude's diff also reformats some unrelated whitespace, renames a
        variable for "clarity," and refactors a helper function. None of that
        was asked for. Some of it might be good; some of it might be a subtle
        bug.
      </p>
      <p>
        <strong>Push back:</strong> "I only wanted the click-outside fix.
        Revert the other changes."
      </p>

      <h3>2. Unwanted dependencies</h3>
      <p>
        Claude has a tendency to reach for npm packages when a hand-rolled
        version would do. "Add a date formatter" might come back with{' '}
        <code>npm install dayjs</code> when you already have <code>date-fns</code>{' '}
        as a dependency. Every dependency is a maintenance cost.
      </p>
      <p>
        <strong>Push back:</strong> "Use the existing date-fns dependency
        instead of adding a new one."
      </p>

      <h3>3. The "well-intentioned" rewrite</h3>
      <p>
        You ask for a small change to a 300-line file. Claude rewrites half of
        it, "improving" things you didn't ask about. Now you have a giant diff
        to review and can't tell which changes are your actual fix vs.
        Claude's tangential improvements.
      </p>
      <p>
        <strong>Push back:</strong> "Make the change as a surgical edit — only
        modify what's strictly necessary. Don't refactor anything I didn't ask
        about."
      </p>

      <h2>When Claude is just plain wrong</h2>
      <p>
        Claude sometimes <strong>confidently fabricates</strong> facts that
        sound plausible but aren't true. This is the part where you can't
        relax. Three patterns to watch for:
      </p>

      <h3>1. Outdated API knowledge</h3>
      <p>
        Claude has a knowledge cutoff. Libraries and APIs change. If Claude
        says "use <code>FirebaseAuth.useAuthState()</code>" and that function
        doesn't exist, it might have existed in an older version, or Claude
        is hallucinating a plausible-sounding API. Always cross-check against
        actual docs when something doesn't work.
      </p>
      <p>
        We hit this with iOS PWA install: Claude initially said "iOS only
        installs PWAs from Safari, not Chrome." That used to be true. Apple
        changed it. The user observed reality, Claude updated.
      </p>

      <h3>2. Wrong about which file owns what</h3>
      <p>
        In a large codebase, Claude can make up file paths or function names
        that don't exist. Especially common for files Claude hasn't actually
        read — it generates a plausible filename based on the project
        structure. If a path looks suspicious, search the repo to confirm.
      </p>

      <h3>3. Subtly wrong code</h3>
      <p>
        Code that compiles, runs without error, and even produces output that
        looks right — but is silently wrong. This is the most dangerous failure
        mode. Examples we hit:
      </p>
      <ul>
        <li>
          A version of <code>findAisleFromMap</code> that did substring
          matching when exact-match was wanted, causing the "aisle bleed" bug.
          It worked. It just didn't do what we wanted.
        </li>
        <li>
          An import path that resolved to a real module but wasn't the one we
          meant. App ran, didn't behave correctly.
        </li>
      </ul>
      <p>
        Defense: <strong>test the change immediately</strong>. Don't trust
        Claude's "this should work" — actually run it.
      </p>

      <h2>Iterating: don't restart, refine</h2>
      <p>
        Common rookie mistake: Claude produces something close to what you
        wanted but not quite. You give up, delete the change, start over with
        a different prompt. <strong>Don't.</strong>
      </p>
      <p>Instead, refine in the same conversation:</p>
      <pre><code>{`Two tweaks:
- The X icon is too small at this size; bump it from 12px to 16px
- The dropdown is opening upward, but it should open downward
  (the items below it are getting cut off)`}</code></pre>
      <p>
        Claude has all the context of what it just did. Iterating is a one-paragraph
        fix; restarting is 5 minutes of re-explaining the original ask.
      </p>

      <h2>Debugging together</h2>
      <p>
        When something breaks, Claude is a great debugging partner — but you
        have to give it the actual error.
      </p>
      <pre><code>{`Bad: "the deploy is broken"

Good: "firebase deploy --only functions fails with:
'Error: Cannot find module 'cheerio' Imported from /workspace/index.js
Did you mean to import cheerio?'

I just ran npm install in the functions/ folder. Why is it still
missing?"`}</code></pre>
      <p>
        Paste the actual error text. Mention what you've already tried. Claude
        can ground its diagnosis in the real symptoms instead of guessing.
      </p>

      <h2>What good code review with Claude looks like</h2>
      <p>You can ask Claude to review its own code, or yours:</p>
      <pre><code>{`Review the changes you just made for:
- Edge cases I didn't think of
- Performance issues
- Anything that's harder to maintain than it needs to be`}</code></pre>
      <p>
        Claude is often pretty good at this — it'll often catch issues in code
        it just wrote, because the review framing engages a different mode
        than the writing framing.
      </p>

      <h2>The "fresh agent" trick</h2>
      <p>
        Sometimes you want an independent opinion. Claude Code has subagents:
        agents that don't have your conversation's context, so they'll evaluate
        the change with fresh eyes. Useful for code review especially. Look up
        the <code>code-reviewer</code> subagent.
      </p>

      <h2>The two things you should NEVER outsource</h2>
      <ol>
        <li>
          <strong>Understanding what changed in your codebase.</strong> If
          you ship a change, you should be able to describe in plain English
          what it does and why. Don't just trust Claude's commit messages —
          actually read the code.
        </li>
        <li>
          <strong>The decision to deploy.</strong> Claude can run <code>firebase
          deploy</code>; only you should decide that the changes are
          actually ready to go live. Have a real "would I be embarrassed if
          this shipped right now?" gut check before pulling the trigger.
        </li>
      </ol>
      <p>
        Everything else — the typing, the boilerplate, the looking-up of
        syntax — go nuts. Delegate freely. But staying engaged on the two
        items above keeps the work yours.
      </p>

      <Quiz
        questions={[
          {
            q: "Claude's diff fixes the bug you asked about — but also refactors a helper function and reformats some unrelated whitespace. What do you do?",
            choices: [
              "Accept it; tidiness is good",
              "Push back: 'I only wanted the bug fix. Revert the other changes and make the edit surgical.'",
              "Ask Claude to also rewrite the rest of the file while you're at it",
              "Cancel the request and start over with a fresh prompt",
            ],
            correct: 1,
            explanation: "Scope creep is the #1 thing to watch for in Claude diffs. The 'just the fix, please' push-back is the highest-leverage habit in Claude collaboration. Surprise refactors are how subtle bugs sneak in.",
          },
          {
            q: "Claude says 'use FirebaseAuth.useAuthState() — it's the standard hook for this.' You try it and TypeScript errors. What's likely going on?",
            choices: [
              "Your install is broken",
              "Claude may be remembering an outdated or made-up API. Check the actual Firebase docs (or grep the firebase package) before trying weird workarounds.",
              "TypeScript is the problem",
              "Restart your editor",
            ],
            correct: 1,
            explanation: "Confident fabrication is the failure mode that bites you. Cross-check anything that doesn't immediately work against the real docs. With time, you'll develop a feel for which Claude assertions to spot-check.",
          },
          {
            q: "Claude wrote some new code and the manual test seems to work. What's the riskiest thing about declaring victory now?",
            choices: [
              "The code might not be DRY enough",
              "Code that runs without errors AND produces output that looks right can still be silently wrong (the 'aisle bleed' bug was exactly this). Test edge cases, don't just confirm the happy path.",
              "Variable names might be ugly",
              "You forgot to run the linter",
            ],
            correct: 1,
            explanation: "The most dangerous bugs in Claude-assisted code are the ones where it works enough to look fine, but is doing something subtly wrong. Always test more than the happy path. 'It compiled' is not 'it's correct.'",
          },
          {
            q: "Claude produced a UI component that's 80% right. The icon's wrong size and the dropdown opens upward instead of downward. What should you do?",
            choices: [
              "Delete it and write a new prompt from scratch",
              "Iterate in the same conversation: 'Two tweaks: bump the icon from 12px to 16px, and make the dropdown open downward.'",
              "Manually edit the file yourself",
              "Find a different AI to redo it",
            ],
            correct: 1,
            explanation: "Don't restart when you can refine. Claude has the full context of what it just built; iteration is a one-paragraph adjustment, restart is 5 minutes of re-explaining the original ask plus the risk of throwing away the 80% that was right.",
          },
        ]}
      />
    </>
  )
}
