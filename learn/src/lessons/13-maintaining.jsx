import Quiz from '../components/Quiz.jsx'

export default function Maintaining() {
  return (
    <>
      <p className="lead">
        The app is shipped. Now the boring-but-essential part: keeping it
        working. This lesson covers the workflow for shipping changes, where
        to look when something breaks, how to roll back safely, and the
        ongoing habits that prevent disasters.
      </p>

      <h2>The change-shipping loop</h2>
      <p>For any small-to-medium change, the cycle looks like:</p>
      <ol>
        <li>Pull the latest code: <code>git pull</code></li>
        <li>Run the dev server: <code>npm run dev</code></li>
        <li>Make the change (with or without Claude)</li>
        <li>Test it locally — click around, try edge cases</li>
        <li>Stage and commit: <code>git add . &amp;&amp; git commit -m "what you did and why"</code></li>
        <li>Push: <code>git push</code></li>
        <li>Build + deploy: <code>npm run build &amp;&amp; firebase deploy --only hosting</code></li>
        <li>Visit the live site, verify it actually works</li>
      </ol>
      <p>
        Steps 6 and 7 don't have to be in that order, and you can skip the
        push if you don't want to share the change. But for anything you're
        deploying, push to GitHub first — that way the code is backed up and
        your uncle (or future you) can see what changed.
      </p>

      <h2>Commit messages that don't suck</h2>
      <p>The pattern that pays off:</p>
      <pre><code>{`Short summary (under 70 chars)

Longer description if needed: what the change is and WHY you made it.
The "what" is usually visible in the diff. The "why" is what future-you
will be looking for in six months when something breaks and you're
trying to understand the context.`}</code></pre>
      <p>Good example:</p>
      <pre><code>{`Tighten aisle map matching to exact-key only

The fuzzy substring matching was bleeding aisle assignments across
items — setting "tomato" to Produce also caught "tomato sauce" and
"cherry tomatoes." Less convenient (no auto-apply across variants),
but much less surprising. Users see ONE row change when they touch ONE
row.`}</code></pre>
      <p>Six months from now, you'll be glad you wrote the second paragraph.</p>

      <h2>When something breaks: the three places to look</h2>

      <h3>1. Browser DevTools console</h3>
      <p>
        Right-click → Inspect → Console tab. Most frontend bugs (white screen,
        button doesn't work, weird error) show up here as a red message with
        a file:line. Search the file:line, you usually find the bug fast.
      </p>
      <p>
        Also check the <strong>Network tab</strong> — failed requests to
        Firestore or Cloud Functions appear here. Status code 403 = permission
        problem. 500 = server-side error.
      </p>

      <h3>2. Firebase Console → Functions → Logs</h3>
      <p>
        For backend errors, the function logs are at{' '}
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a>{' '}
        → your project → Functions → Logs (or via CLI:{' '}
        <code>firebase functions:log</code>). Each function invocation logs
        what came in, what went out, and any thrown errors.
      </p>
      <p>The most common backend symptoms and causes:</p>
      <ul>
        <li><strong>"Function returned undefined"</strong> — bug in your function code; check Logs for the actual error</li>
        <li><strong>503 from the function</strong> — usually the function is throwing an HttpsError that's surfacing as 503 (see our recipe-import 4xx-mapping logic)</li>
        <li><strong>CORS error in browser</strong> — public invoker grant missing on a newly deployed function</li>
        <li><strong>Function not found</strong> — the function name in your client code doesn't match the deployed name</li>
      </ul>

      <h3>3. Firebase Console → Hosting → Release history</h3>
      <p>
        Shows every deployment, when it happened, and lets you roll back to a
        previous version with one click. If you just shipped something and
        the live site immediately broke, this is your get-out-of-jail-free
        card.
      </p>

      <h2>Rolling back</h2>
      <p>Two flavors:</p>

      <h3>Hosting (frontend)</h3>
      <p>
        Firebase Console → Hosting → Release history → "..." menu next to a
        known-good version → "Rollback." Live within ~30 seconds. The bad
        version stays in history so you can deploy it again if it turns out to
        be needed.
      </p>

      <h3>Functions (backend)</h3>
      <p>
        Cloud Functions don't have one-click rollback. To revert, you have to
        revert the source code:
      </p>
      <pre><code>git log --oneline functions/
git revert &lt;commit-hash&gt;     # creates a new "undo" commit
firebase deploy --only functions</code></pre>
      <p>
        Or check out the previous version manually, deploy, then commit the
        revert later.
      </p>

      <h2>The "I broke something locally" recovery</h2>
      <p>Three increasingly destructive options, in order of preference:</p>
      <ol>
        <li>
          <strong>Stash your changes</strong> — <code>git stash</code> tucks
          uncommitted changes away. Get back to a clean tree. <code>git stash
          pop</code> brings them back when you're ready.
        </li>
        <li>
          <strong>Discard specific file changes</strong> — <code>git restore
          path/to/file</code> reverts that file to its last-committed state.
          Surgical.
        </li>
        <li>
          <strong>Throw away everything since last commit</strong> — <code>git
          reset --hard HEAD</code>. <strong>This deletes uncommitted work
          permanently.</strong> Only do this when you're SURE you don't want
          any of it.
        </li>
      </ol>
      <p>
        Never run <code>git reset --hard</code> casually. Use it only when
        you've already <code>git stash</code>'d anything you might want, or
        when you genuinely don't care.
      </p>

      <h2>Updating dependencies</h2>
      <p>Periodically (every few months) check for updates:</p>
      <pre><code>npm outdated         # what's out of date
npm audit            # known security issues
npm update           # safe minor/patch bumps</code></pre>
      <p>
        Major version bumps (e.g., react 18 → 19) often have breaking
        changes. Read the upgrade guide before flipping a major. Test
        carefully — run the dev server and click through the app for at
        least a few minutes.
      </p>
      <p>
        We did exactly this in the build of this app: bumped Node 20 → 22
        and firebase-functions v6 → v7. Both required reading release notes,
        and v7 had subtle deploy-process changes that took two attempts to
        get right. HANDOFF.md has the war story.
      </p>

      <h2>The keep-current-or-die habit: HANDOFF.md</h2>
      <p>
        Every non-trivial change should update <code>HANDOFF.md</code>. It's
        the running reference doc — the thing future-you (or a new
        contributor) reads first to understand what's going on.
      </p>
      <p>Things to keep current in HANDOFF.md:</p>
      <ul>
        <li>Architecture changes (new tables, new cloud functions, big refactors)</li>
        <li>Pre-deploy gotchas (the GoDaddy DNS thing, the firebase.json runtime override, the public-invoker requirement for new functions)</li>
        <li>Anything that took you more than an hour to figure out the first time</li>
      </ul>
      <p>
        Skip updates for trivial things (renamed a variable, added a button).
        But the "I'd have wanted to know this when I started" stuff —
        write it down.
      </p>

      <h2>The pre-deploy checklist (steal this)</h2>
      <p>Before <code>firebase deploy</code>, ask yourself:</p>
      <ul>
        <li>Did I run the change locally and verify it works?</li>
        <li>Did I commit the change to git first?</li>
        <li>If it touches functions, did I <code>node --check functions/index.js</code> to catch syntax errors?</li>
        <li>If it's a new function, do I need to grant <code>allUsers</code> the invoker role afterward?</li>
        <li>Have I updated HANDOFF.md if anything architectural changed?</li>
      </ul>
      <p>Most of the time the answer to all five is "yes, already done" and you're fine. But running through the list catches the surprises.</p>

      <Quiz
        questions={[
          {
            q: "Your last deploy broke the live site. What's the fastest fix?",
            choices: [
              "Manually edit files in production",
              "Firebase Console → Hosting → Release history → Rollback to the last working version. Live in ~30 seconds.",
              "Cancel the deploy mid-flight",
              "Email Firebase support",
            ],
            correct: 1,
            explanation: "Hosting rollback is one click and almost instant. Fix the bug locally, redeploy when ready. The rollback isn't permanent — you can always re-deploy the broken version if you realize it was actually fine.",
          },
          {
            q: "You see a 503 in the browser when calling a Cloud Function. Where do you look first?",
            choices: [
              "Reload the page a few times",
              "Firebase Console → Functions → Logs (or firebase functions:log). The function is throwing an error; logs show what.",
              "Reinstall the Firebase CLI",
              "Wait for it to fix itself",
            ],
            correct: 1,
            explanation: "503 from a Cloud Function almost always means the function is throwing an error (often an HttpsError surfacing as 503). The logs tell you which line, which input, which exception. That's almost always faster than guessing.",
          },
          {
            q: "You have uncommitted changes you want to set aside temporarily without losing them. What's the right command?",
            choices: [
              "git reset --hard HEAD",
              "git stash (tucks them away; git stash pop brings them back later)",
              "git rm",
              "Just delete the files",
            ],
            correct: 1,
            explanation: "git stash is the safe option. git reset --hard permanently destroys uncommitted work. When in doubt, stash first — you can always pop it back.",
          },
          {
            q: "You spent 90 minutes tracking down a subtle Cloud Functions deploy issue caused by firebase.json overriding package.json. After fixing it, what's the highest-value next action?",
            choices: [
              "Move on; you fixed it, no need to dwell",
              "Add the gotcha to HANDOFF.md so the next person (or future you) doesn't burn 90 minutes on the same thing",
              "File a bug with Google",
              "Rewrite the deploy script",
            ],
            correct: 1,
            explanation: "Every hour of discovery should leave a documentation trail. The whole point of HANDOFF.md is to compound the team's understanding over time. Things that take you an hour now should take the next person 30 seconds because you wrote it down.",
          },
        ]}
      />
    </>
  )
}
