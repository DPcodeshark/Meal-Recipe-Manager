import Quiz from '../components/Quiz.jsx'

export default function DataLayer() {
  return (
    <>
      <p className="lead">
        The Dinner App's "brain" is <strong>Firestore</strong> — a cloud
        database where every meal, every grocery item, every planned dinner
        lives. This is the lesson where we cover how databases store data, how
        the app reads and writes it, and how everyone's phone stays in sync in
        real time.
      </p>

      <h2>What's Firestore?</h2>
      <p>
        Firestore is a <strong>NoSQL document database</strong>. Two words to
        unpack:
      </p>
      <ul>
        <li>
          <strong>NoSQL</strong> — unlike SQL (Postgres, MySQL), there are no
          tables, no rows, no enforced schema. You just store JSON-shaped
          documents.
        </li>
        <li>
          <strong>Document</strong> — each thing you save is a key-value object
          with arbitrary nested fields. Like a JSON file with an ID.
        </li>
      </ul>
      <p>Documents are organized into <strong>collections</strong>. A meal looks like:</p>
      <pre><code>{`families/abc123/meals/xyz789
{
  "name": "Beef Stroganoff",
  "cuisine": "American",
  "ingredients": ["1 lb beef", "2 cups noodles", ...],
  "favorite": true,
  "ratings": { "Alex": "up", "Sam": "down" }
}`}</code></pre>
      <p>
        That whole path — <code>families/abc123/meals/xyz789</code> — is the
        document's address. <code>families</code> and <code>meals</code> are
        collections; <code>abc123</code> and <code>xyz789</code> are document
        IDs. Collections can be nested inside documents (a family <em>has</em>{' '}
        meals).
      </p>
      <p>
        Look at <code>HANDOFF.md</code> in the repo — the "Firestore Data
        Model" section shows the full tree for this app.
      </p>

      <h2>The real magic: real-time sync</h2>
      <p>
        Most databases are request/response: you ask for data, you get it, then
        you ask again later if you want updates. Firestore lets you{' '}
        <strong>subscribe</strong>. Tell Firestore "I want to watch this
        document," and any time anyone, anywhere changes it, your code gets
        called with the new data.
      </p>
      <p>This is what makes the app feel alive. Open <code>src/pages/WeekView.jsx</code> and look for <code>onSnapshot</code>:</p>
      <pre><code>{`useEffect(() => {
  const ref = doc(db, 'families', familyId, 'weeks', weekId)
  const unsub = onSnapshot(ref, snap => {
    setWeekPlan(snap.exists() ? snap.data() : { days: {} })
  })
  return unsub
}, [familyId, weekId])`}</code></pre>
      <p>
        That single hook subscribes to one week's planning data. When another
        family member drags a meal onto Thursday from their phone, Firestore notifies
        every connected device, this callback fires, <code>setWeekPlan</code>{' '}
        updates React's state, and the UI re-renders. Sub-second.
      </p>

      <h2>Reading data</h2>
      <p>Three ways, depending on what you need:</p>
      <ul>
        <li>
          <code>getDoc(ref)</code> — fetch once, no subscription. Use for
          one-off data that won't change.
        </li>
        <li>
          <code>onSnapshot(ref, callback)</code> — subscribe to live updates.
          Use for anything that should update when someone else changes it.{' '}
          <strong>This is the default in this app.</strong>
        </li>
        <li>
          <code>getDocs(query)</code> / <code>onSnapshot(query)</code> —
          fetch/subscribe to a whole collection, optionally filtered.
        </li>
      </ul>

      <h2>Writing data</h2>
      <p>Also three patterns:</p>
      <ul>
        <li>
          <code>setDoc(ref, data)</code> — write/overwrite a whole document at
          a known path
        </li>
        <li>
          <code>setDoc(ref, partial, {`{ merge: true }`})</code> — merge fields
          into an existing document without overwriting everything else
        </li>
        <li>
          <code>updateDoc(ref, partial)</code> — update specific fields (errors
          if doc doesn't exist)
        </li>
        <li>
          <code>addDoc(collectionRef, data)</code> — add a new doc with an
          auto-generated ID
        </li>
        <li>
          <code>deleteDoc(ref)</code> — delete a doc
        </li>
      </ul>
      <p>
        Look at <code>handleAddMeal</code> in <code>src/pages/MealLibrary.jsx</code>{' '}
        — that's an <code>addDoc</code>. Or <code>toggleFavorite</code> just
        below it — an <code>updateDoc</code>. The patterns are everywhere; once
        you've seen a few you'll recognize the shape.
      </p>

      <h2>Authentication</h2>
      <p>
        Firestore won't let just anyone read or write a family's data — there's
        an authentication layer. The Dinner App uses{' '}
        <strong>Firebase Anonymous Auth</strong>: every browser gets a unique,
        random identifier the first time it visits, and that identifier persists.
        No email, no password, no Google sign-in.
      </p>
      <p>
        Look at <code>src/context/FamilyContext.jsx</code>:
      </p>
      <pre><code>{`signInAnonymously(auth)`}</code></pre>
      <p>
        That one line gets you a Firebase identity for security-rules purposes.
        It doesn't identify <em>which family member</em> you are — that's
        what the <strong>family PIN</strong> + the avatar picker do. The PIN
        unlocks which family's data you see; the avatar pick records who you
        are <em>within</em> that family (so meals you add are tagged{' '}
        <code>addedBy: "Alex"</code>, ratings show up with your initial, etc.).
      </p>
      <p>
        It's a stripped-down auth model. <strong>Pros</strong>: zero friction —
        a kid can install and use the app in 30 seconds. <strong>Cons</strong>:
        anyone with the PIN can see/edit everything, and the PIN can be
        guessed. For a family-of-five tool that's fine. For a real product
        you'd add email-based identity, two-factor, password reset, etc.
      </p>

      <h2>Security rules (the part we cheat on)</h2>
      <p>
        Firestore uses a special config file called <strong>security rules</strong>{' '}
        that defines who can read/write what. Production apps lock things down
        carefully — "only authenticated users from family X can read documents
        under <code>families/X</code>", etc.
      </p>
      <p>
        For this app, we run in <strong>test mode</strong>: anyone who has the
        Firebase project's API key can read or write anything. The API key is in
        the deployed app's JavaScript, so technically the data isn't private.
        But: the PIN gate means you have to know <em>which</em> family ID to
        target, and the family ID isn't trivially guessable.
      </p>
      <p>
        <strong>This is a real corner we cut.</strong> Properly locking it down
        with Firestore rules is a future-self task. The cost: if a stranger
        somehow learns the family ID, they could read/write data. The
        likelihood, in our threat model: vanishingly low. The fix when we get
        around to it: tie writes to the authenticated user being a member of
        the family doc.
      </p>

      <h2>How to inspect the data yourself</h2>
      <p>
        Your uncle can show you the Firebase Console: go to{' '}
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a>{' '}
        → select the <code>zavod-meals</code> project → Firestore Database. You'll see a tree view of every collection and document.
        Click around. It'll click once you see the real data structure.
      </p>
      <figure className="screenshot">
        <img src="/learn/firestore-console.png" alt="Firebase Firestore Console showing the Dinner App's data: the (default) database on the left, the families collection in the middle with one document (a random auto-generated ID), and that document expanded on the right showing four subcollections (groceryLists, meals, settings, weeks) and a members array with name/role fields for each family member." />
        <figcaption>
          A real view of this app's Firestore. Notice four things: (1) the
          family's document ID is a random string Firebase auto-generated
          — opaque to humans, perfect for code. (2) The <code>members</code>{' '}
          field is a nested array inside the family document — Firestore can
          hold complex nested structures, unlike SQL. (3) Subcollections
          (<code>groceryLists</code>, <code>meals</code>, <code>settings</code>,{' '}
          <code>weeks</code>) live <em>inside</em> the family document. The
          full path to a planned week looks like{' '}
          <code>families/{`{familyId}`}/weeks/{`{weekId}`}</code>. (4) The
          family name (<code>"The Zavods"</code>) is just another field,
          alongside <code>members</code>. Both are first-class data.
        </figcaption>
      </figure>

      <Quiz
        questions={[
          {
            q: "What's the difference between getDoc and onSnapshot?",
            choices: [
              "getDoc is faster",
              "getDoc fetches once and returns; onSnapshot subscribes and re-fires every time the data changes anywhere",
              "onSnapshot only works for writes",
              "They're the same",
            ],
            correct: 1,
            explanation: "getDoc = give me the current value. onSnapshot = give me the current value AND keep me updated. The 'real-time sync' magic of the app is built on onSnapshot.",
          },
          {
            q: "One family member opens the planner on their phone. Another, on a different phone, drags a meal onto Tuesday. What does the first phone do?",
            choices: [
              "Nothing — he needs to refresh",
              "His onSnapshot callback fires with the updated week document; React re-renders; the new meal appears on Tuesday automatically",
              "His phone polls Firestore every 10 seconds until it sees the change",
              "A push notification appears asking him to refresh",
            ],
            correct: 1,
            explanation: "Both phones are subscribed to the same week document via onSnapshot. The second user's setDoc updates Firestore; Firestore pushes the change to everyone watching that document. Sub-second sync, no refresh needed.",
          },
          {
            q: "Why use Firestore instead of a SQL database like Postgres?",
            choices: [
              "Firestore is always faster",
              "For an app like this — small, document-shaped data with real-time sync needs — Firestore's NoSQL model and onSnapshot integration are much less code than equivalent SQL+websocket plumbing",
              "SQL doesn't work on the web",
              "Postgres is expensive",
            ],
            correct: 1,
            explanation: "Picking a database is about fit, not 'best.' For nested document data (family > meals, family > weeks) and live multi-device sync, Firestore is a huge win in lines of code and operational simplicity. For relational data with complex joins, SQL is still king.",
          },
          {
            q: "The app uses anonymous auth. What does the 4-digit PIN actually do then?",
            choices: [
              "It encrypts the data",
              "It's a shared family password that gates which family's data you can see — the anonymous auth gives you a Firebase identity, the PIN picks the family",
              "It logs you into a Google account",
              "It tells Firebase you're not a bot",
            ],
            correct: 1,
            explanation: "Anonymous Auth = Firebase gives you a random user ID for rules purposes. PIN = which family you're joining. Avatar pick = which family member you are. Three separate concepts. None of them is a 'real' login in the email/password sense.",
          },
        ]}
      />
    </>
  )
}
