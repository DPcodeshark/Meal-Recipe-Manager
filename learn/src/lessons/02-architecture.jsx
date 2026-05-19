import Quiz from '../components/Quiz.jsx'

export default function Architecture() {
  return (
    <>
      <p className="lead">
        Before we look at a single file, let's get the mental picture clear:
        what <em>is</em> a web app, really? Most apps that look complicated are
        five or six pieces glued together. Once you see the pieces, the whole
        thing stops feeling magical.
      </p>

      <h2>The five pieces</h2>
      <p>
        Every modern web app is made of roughly these parts. The Dinner App has
        all of them; so does Gmail, Slack, and your bank's website. The names
        change, the shapes don't.
      </p>

      <div className="arch-stack">
        <div className="arch-block">
          <span className="arch-num">1</span>
          <div>
            <h3>A code repository</h3>
            <p>The source of truth — a bunch of files (JavaScript, CSS, HTML, configuration) plus a full history of every change ever made. Lives on <strong>GitHub</strong> for this app, at <a href="https://github.com/DPcodeshark/Meal-Recipe-Manager" target="_blank" rel="noopener noreferrer">DPcodeshark/Meal-Recipe-Manager</a>. Think of it like a Google Doc with version history, but for a thousand interconnected files.</p>
          </div>
        </div>

        <div className="arch-arrow" aria-hidden="true">↓ <em>npm run build turns source code into browser-ready files</em></div>

        <div className="arch-block">
          <span className="arch-num">2</span>
          <div>
            <h3>A hosting service</h3>
            <p>A place that stores the compiled app and serves it to anyone who asks. For us that's <strong>Firebase Hosting</strong> — Google's static-file delivery service. Like a warehouse + delivery truck combo: the files sit on a server, and when a browser asks for them, they come back fast.</p>
          </div>
        </div>

        <div className="arch-arrow" aria-hidden="true">↓ <em>but how does a phone find the hosting service?</em></div>

        <div className="arch-block">
          <span className="arch-num">3</span>
          <div>
            <h3>A domain name</h3>
            <p><strong>zavods.com</strong>. We registered it through GoDaddy. The domain has DNS records pointing at Firebase Hosting's IP addresses — so when you type <code>zavods.com/meals</code>, your phone first asks "where does zavods.com live?", gets pointed at Firebase, and then asks Firebase for the page. The whole DNS dance happens in milliseconds and you never see it.</p>
          </div>
        </div>

        <div className="arch-arrow" aria-hidden="true">↓ <em>the browser now has the app code. Where does the data live?</em></div>

        <div className="arch-block">
          <span className="arch-num">4</span>
          <div>
            <h3>A database</h3>
            <p>The app itself is just templates — no meals, no grocery lists, no users. The actual data lives in <strong>Firestore</strong> (another Google service, also part of Firebase). When you tap a day to assign a meal, the app sends that change to Firestore. When your spouse opens the app on their phone, it reads the same Firestore and sees your change. <strong>Firestore is the shared brain.</strong></p>
          </div>
        </div>

        <div className="arch-arrow" aria-hidden="true">↓ <em>some things browsers can't safely do…</em></div>

        <div className="arch-block">
          <span className="arch-num">5</span>
          <div>
            <h3>Serverless functions</h3>
            <p>Sometimes you need to do something that's risky or impossible from a browser — like scraping a recipe website (browsers can't talk to other domains directly because of security), or calling an external API with a secret key (you'd be giving the secret to every user). Those tasks run on <strong>Cloud Functions</strong>: tiny pieces of backend code that wake up only when called, do their job, then go back to sleep. Our four functions handle recipe imports and searches.</p>
          </div>
        </div>
      </div>

      <h2>The whole flow, in one breath</h2>
      <p>
        You tap the Dinner App icon on your phone. iOS resolves zavods.com to Firebase's IP addresses (DNS). Your phone asks Firebase for <code>/meals/</code>. Firebase sends back the HTML and JavaScript files. Those files run in your browser — they're the React app. The app asks Firestore "what meals are planned this week?" Firestore responds. The app draws the planner. You drag a meal onto a day. The app sends that change to Firestore. Firestore tells everyone else's phone in real time, "hey, there's a new meal on Thursday." Their planner updates without a refresh.
      </p>
      <p>
        That's the whole app. Five pieces, one second.
      </p>

      <h2>Where it costs money</h2>
      <p>
        For a family of five, all of this is <strong>free or near-free</strong>:
      </p>
      <ul>
        <li><strong>GitHub</strong> — free for public repos, free for private repos with small teams</li>
        <li><strong>Firebase Hosting</strong> — generous free tier (10 GB storage, 360 MB/day bandwidth). We use a few hundred KB.</li>
        <li><strong>Firestore</strong> — free up to 50K reads, 20K writes, 1 GB stored per day. We use a few hundred of each, on a busy day.</li>
        <li><strong>Cloud Functions</strong> — free up to 2 million invocations/month. We get maybe a few hundred.</li>
        <li><strong>Domain</strong> — about $15/year for zavods.com at GoDaddy. The only fixed cost.</li>
      </ul>
      <p>
        Cloud companies subsidize hobby projects because they hope you'll grow into a paying customer. As long as the Dinner App stays family-sized, total monthly cost is roughly $1.25.
      </p>

      <h2>How to access this codebase</h2>
      <p>
        The GitHub repo is at <a href="https://github.com/DPcodeshark/Meal-Recipe-Manager" target="_blank" rel="noopener noreferrer">DPcodeshark/Meal-Recipe-Manager</a> — public, so you can clone it to your own machine with one command (we'll do that in the Tools lesson next).
      </p>
      <p>
        You won't have access to the real Firestore database (it belongs to your uncle's Firebase project), but that's fine: the code is set up so that if it doesn't find the database credentials, it falls back to a <strong>demo mode</strong> with a fake family and fake data. You can run the whole app locally and click through every feature without ever touching real data. We'll cover this in the lesson on running it locally.
      </p>

      <h2>Why this lesson matters</h2>
      <p>
        The biggest skill in software isn't writing code — it's <strong>knowing which piece is broken</strong> when something goes wrong. "The page isn't loading" could be DNS, hosting, the React app, the database, or a function. When you can mentally walk through the five pieces and ask "which one is misbehaving?", you've already done half the debugging work.
      </p>

      <Quiz
        questions={[
          {
            q: "What does Firebase Hosting actually do for our app?",
            choices: [
              "Stores the family's meal data",
              "Serves the compiled HTML/JS/CSS files to anyone who visits the URL",
              "Runs the recipe-import code",
              "Manages the zavods.com domain name",
            ],
            correct: 1,
            explanation: "Hosting = file delivery. The compiled output of `npm run build` lives there, and Firebase ships it to browsers. The data is in Firestore (separate service); the functions run on Cloud Functions; the domain is at GoDaddy.",
          },
          {
            q: "Where do you and your wife's planned meals actually live?",
            choices: [
              "Inside the React app code on GitHub",
              "In a SQL table on Firebase Hosting",
              "In Firestore (the database)",
              "On your phone's local storage only",
            ],
            correct: 2,
            explanation: "Firestore is the shared 'brain.' The app is just a templated view of whatever's in Firestore. That's why your spouse sees your changes seconds after you make them on a different device.",
          },
          {
            q: "Why does the Dinner App use Cloud Functions for recipe import instead of doing it in the browser?",
            choices: [
              "Cloud Functions are faster than browsers",
              "Browsers can't directly fetch from other websites due to security (CORS), and we'd expose private API keys if we tried",
              "It's the law in California",
              "Firebase makes us pay extra if we don't use functions",
            ],
            correct: 1,
            explanation: "Two reasons. CORS prevents a browser at zavods.com from fetching allrecipes.com directly. And the Spoonacular API key needs to stay secret — if we shipped it in the browser code, anyone could read it and run up our bill. Functions solve both.",
          },
          {
            q: "Page won't load. Which of these is NOT one of the five pieces you'd suspect?",
            choices: [
              "DNS (zavods.com pointing somewhere wrong)",
              "Firebase Hosting (files weren't deployed)",
              "Your phone's bluetooth settings",
              "The React app code (a bug crashes on first render)",
            ],
            correct: 2,
            explanation: "Bluetooth isn't part of the web stack. The five pieces — repo, hosting, DNS, database, functions — are the suspects when something on the web breaks. Half of debugging is knowing where NOT to look.",
          },
        ]}
      />
    </>
  )
}
