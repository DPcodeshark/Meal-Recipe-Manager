import Quiz from '../components/Quiz.jsx'

export default function Hosting() {
  return (
    <>
      <p className="lead">
        You wrote some code. You ran <code>npm run build</code> and got a{' '}
        <code>dist/</code> folder. Now what? How does that folder end up at{' '}
        <code>zavods.com/meals</code>? This is the lesson where we walk through
        hosting, custom domains, and the deploy command.
      </p>

      <h2>What hosting actually does</h2>
      <p>
        A "hosting service" is, fundamentally, a public web server with a fast
        delivery network in front of it. You upload files; the service stores
        them; when someone's browser asks for those files, the service sends
        them back, quickly, from a server geographically close to the visitor.
      </p>
      <p>
        That last bit — geographically close — is called a <strong>CDN</strong>{' '}
        (Content Delivery Network). Firebase Hosting has servers around the
        world. When a phone in Seattle asks for <code>zavods.com/meals/</code>,
        it gets it from a Seattle data center. When a phone in Frankfurt asks,
        it's a Frankfurt one. You don't configure this; it just works.
      </p>

      <h2>The deploy command</h2>
      <p>From the project root:</p>
      <pre><code>npm run build
firebase deploy --only hosting</code></pre>
      <p>The first command produces <code>dist/</code>. The second uploads it. The whole cycle takes about 30 seconds on a normal internet connection.</p>
      <p>You can also deploy functions or both:</p>
      <pre><code>firebase deploy --only functions          # just the Cloud Functions
firebase deploy                           # everything (rare; usually you want --only)</code></pre>

      <h2>What firebase.json controls</h2>
      <p>This one file is the hosting configuration. Open it in the repo. Three key sections:</p>

      <h3>functions</h3>
      <p>
        Tells Firebase where the Cloud Functions source lives (<code>functions/</code>),
        which Node version to use (<code>nodejs22</code>), and what to ignore.
        Note: the runtime here overrides the engines field in{' '}
        <code>functions/package.json</code> — a fact we learned the painful way
        (covered in handoff).
      </p>

      <h3>hosting.rewrites</h3>
      <pre><code>{`"rewrites": [
  { "source": "/meals/**", "destination": "/meals/index.html" },
  { "source": "/learn/**", "destination": "/learn/index.html" }
]`}</code></pre>
      <p>
        Rewrites tell Firebase: "if someone requests a URL matching this
        pattern AND no actual file is found, serve this fallback file
        instead." That's how single-page apps handle their own routing.
      </p>
      <p>
        Example flow: you visit <code>zavods.com/meals/grocery</code>. There's
        no <code>grocery</code> file or folder in <code>dist/meals/</code>.
        Without the rewrite, Firebase would 404. With the rewrite, Firebase
        serves <code>dist/meals/index.html</code>. That HTML loads the React
        app. React-router sees the URL is <code>/meals/grocery</code>, picks
        the GroceryList component, renders it. Everyone wins.
      </p>

      <h3>hosting.headers</h3>
      <p>
        Caching policy. Static assets (CSS, JS, images) with content-hashed
        filenames are immutable, so we cache them for a year. HTML and other
        files we cache for a day. This is what makes return visits feel
        instant.
      </p>

      <h2>The deployed structure</h2>
      <p>What actually gets uploaded to Firebase Hosting:</p>
      <pre><code>{`dist/
├── index.html                  ← landing page at /
├── favicon.svg, icons, etc.
├── meals/
│   ├── index.html              ← the Dinner App SPA shell
│   ├── assets/                 ← bundled JS/CSS (hashed names)
│   ├── manifest.webmanifest    ← PWA manifest
│   ├── sw.js                   ← service worker
│   └── icon-*.png
└── learn/
    ├── index.html              ← this learning site
    └── assets/`}</code></pre>
      <p>
        Three independent things in one Firebase Hosting site. Different URLs,
        different React apps (or no React in the landing case), one deploy.
      </p>

      <h2>Custom domains</h2>
      <p>By default Firebase gives you a URL like:</p>
      <pre><code>zavod-meals.web.app</code></pre>
      <p>
        That works forever, but it's not memorable. The real domain{' '}
        <code>zavods.com</code> has to be told "send your traffic to Firebase."
        That's what DNS does.
      </p>

      <h3>The DNS dance</h3>
      <p>Step by step, when someone types <code>zavods.com/meals</code> in their browser:</p>
      <ol>
        <li>
          Browser asks the OS: "what IP is zavods.com?"
        </li>
        <li>
          OS asks its DNS resolver (usually your ISP's or 1.1.1.1).
        </li>
        <li>
          Resolver doesn't know, so it asks <code>.com</code>'s DNS root who
          owns <code>zavods.com</code>.
        </li>
        <li>
          The root says "ns45.domaincontrol.com" (GoDaddy's nameservers).
        </li>
        <li>
          Resolver asks GoDaddy's nameservers: "what's zavods.com's A record?"
        </li>
        <li>
          GoDaddy answers with Firebase's IPs (we configured this in our DNS
          panel).
        </li>
        <li>
          Browser connects to that IP, makes the request, Firebase Hosting
          replies with our files.
        </li>
      </ol>
      <p>
        It's a lot of steps, and they all happen in milliseconds, cached
        aggressively. You'll only think about DNS when something breaks.
      </p>

      <h3>The setup process</h3>
      <p>To add <code>zavods.com</code> to our Firebase Hosting site:</p>
      <ol>
        <li>Firebase Console → Hosting → Add custom domain → enter <code>zavods.com</code></li>
        <li>Firebase gives us two records to add at GoDaddy (or wherever the domain is): an <code>A</code> record pointing at <code>199.36.158.100</code>, and a <code>TXT</code> record for ownership verification</li>
        <li>Add them at GoDaddy's DNS panel</li>
        <li>Wait 10–60 minutes for DNS propagation and SSL certificate provisioning</li>
        <li>Firebase Console shows "Connected" and <code>https://zavods.com</code> serves your site</li>
      </ol>
      <p>
        The SSL certificate (the <code>https://</code> lock icon) is auto-issued
        and auto-renewed by Firebase. You don't think about it again.
      </p>

      <h3>The hidden trap we hit</h3>
      <p>
        Our domain at GoDaddy had a hidden "WebsiteBuilder Site" entry that
        secretly injected two AWS IP addresses into our A records — IPs that
        weren't visible in the DNS records UI. Firebase saw them in public DNS,
        kept saying "remove these records," and we couldn't find where they
        lived. Eventually traced it to GoDaddy's WebsiteBuilder integration,
        deleted that row, and DNS was clean.
      </p>
      <p>
        Why this matters: registrar-specific weirdness is common. The lesson is{' '}
        <strong>trust public DNS over any registrar's UI</strong>. If <code>dig</code>{' '}
        (or <code>https://dns.google/resolve?name=…</code>) says a record
        exists, it exists, even if the registrar pretends it doesn't.
      </p>

      <h2>Rollback</h2>
      <p>
        Deploy a bug? Firebase Hosting keeps the last several versions. Console
        → Hosting → Release history → click "..." next to a known-good version
        → "Rollback." Live within seconds.
      </p>

      <figure className="screenshot">
        <img src="/learn/hosting-deploys.png" alt="Firebase Hosting Releases page for the zavod-meals project showing five recent deploys. Each row has a status icon, timestamp, deployer (gDavep@gmail.com), version hash, and file count. The '...' menu is open on one of the rows revealing Rollback and Delete options." />
        <figcaption>
          The release history table — every deploy is here, with its hash
          and file count. The popup menu on the right shows the{' '}
          <strong>Rollback</strong> option that's the lesson's whole point:
          one click and the live site reverts to that version in about 30
          seconds. The starred row is the currently-live release. Knowing
          this exists changes how nervous you should be about deploying —
          which is to say, not very.
        </figcaption>
      </figure>

      <Quiz
        questions={[
          {
            q: "You navigate to https://zavods.com/meals/grocery in a browser. There's no 'grocery' file or folder in dist/meals/. Why don't you get a 404?",
            choices: [
              "Firebase auto-creates the file",
              "The hosting.rewrites rule maps /meals/** to /meals/index.html, so the SPA shell loads and react-router takes it from there",
              "Browsers ignore 404s by default",
              "The request times out and falls back to the homepage",
            ],
            correct: 1,
            explanation: "Rewrites are SPA glue. Without them, deep links into a single-page app would 404 on first load. The rewrite says 'serve the index HTML for any path under this prefix' and lets the JavaScript router pick up from there.",
          },
          {
            q: "Why does Firebase Hosting feel fast no matter where you visit from?",
            choices: [
              "Firebase secretly runs your dev server",
              "It's a CDN — files are cached on servers around the world, so visitors fetch from a nearby data center",
              "Browsers prefetch everything before you click",
              "It's not actually fast, that's an illusion",
            ],
            correct: 1,
            explanation: "Hosting + CDN is the unspoken win of services like Firebase Hosting, Netlify, Vercel, Cloudflare Pages. Your dist/ folder gets replicated globally; visitors hit whatever's closest. You configure nothing.",
          },
          {
            q: "What's the difference between firebase deploy and firebase deploy --only hosting?",
            choices: [
              "No difference",
              "The first deploys everything (hosting, functions, rules, etc.); the second deploys only the static files",
              "--only hosting requires extra permissions",
              "The first is for production, the second for staging",
            ],
            correct: 1,
            explanation: "Use --only when you know what you're changing. firebase deploy with no flags re-deploys everything — sometimes desirable, often slower than needed, occasionally triggers an unwanted side-effect if you forgot something else is queued.",
          },
          {
            q: "The DNS records UI at the registrar shows no surprise records, but Firebase keeps insisting they exist. What's the move?",
            choices: [
              "Trust the registrar UI; Firebase is wrong",
              "Trust public DNS (dig or dns.google/resolve) — if it shows a record, the record exists somewhere in the registrar's config (often hidden in 'parking,' 'forwarding,' or 'site integration' UIs)",
              "Cancel and re-register the domain",
              "Wait 24 hours; DNS will fix itself",
            ],
            correct: 1,
            explanation: "Registrar UIs hide system-managed records all the time (we hit this with GoDaddy's WebsiteBuilder injection). Public DNS is the ground truth — when there's a mismatch, public DNS wins, and you keep digging in the registrar settings until you find what's injecting the records.",
          },
        ]}
      />
    </>
  )
}
