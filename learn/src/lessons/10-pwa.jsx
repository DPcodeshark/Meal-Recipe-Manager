import Quiz from '../components/Quiz.jsx'

export default function PWA() {
  return (
    <>
      <p className="lead">
        The Dinner App isn't on the App Store, yet your family installed it on
        their iPhones and it runs full-screen with a chef-hat icon. That's a{' '}
        <strong>PWA</strong> — a Progressive Web App. Three pieces of plumbing
        make a regular website "installable." Let's look at all three.
      </p>

      <h2>What's a PWA?</h2>
      <p>
        A PWA is a regular web app with three extra files that let browsers
        treat it like a native app:
      </p>
      <ol>
        <li>
          <strong>A manifest file</strong> — tells the browser "I'm
          installable. Here's my name, icon, and theme color."
        </li>
        <li>
          <strong>A service worker</strong> — a script that runs in the
          background, can cache the app for offline use, and intercepts
          network requests.
        </li>
        <li>
          <strong>HTTPS</strong> — service workers don't run over plain HTTP,
          for security. Firebase Hosting gives us this for free.
        </li>
      </ol>
      <p>
        That's it. Add those three things to any web app and "Add to Home
        Screen" starts working. The result is indistinguishable from a native
        app for many use cases.
      </p>

      <h2>How vite-plugin-pwa handles all this</h2>
      <p>
        We don't write any of the PWA plumbing by hand. The{' '}
        <code>vite-plugin-pwa</code> Vite plugin handles it. In{' '}
        <code>vite.config.js</code>:
      </p>
      <pre><code>{`VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: '/meals/index.html',
    navigateFallbackAllowlist: [/^\\/meals\\//],
  },
  manifest: {
    name: 'Dinner App — Family Meal Planner',
    short_name: 'Dinner App',
    theme_color: '#fdf8f1',
    background_color: '#fdf8f1',
    display: 'standalone',
    start_url: '/meals/',
    scope: '/meals/',
    icons: [...]
  }
})`}</code></pre>
      <p>When you <code>npm run build</code>, the plugin generates:</p>
      <ul>
        <li><code>manifest.webmanifest</code> in your output, derived from the config above</li>
        <li><code>sw.js</code> — the service worker</li>
        <li><code>registerSW.js</code> — a tiny script that registers the SW when the app loads</li>
      </ul>

      <h2>The manifest</h2>
      <p>Here's what each manifest field actually controls:</p>
      <ul>
        <li><strong>name / short_name</strong> — what shows under the icon on the home screen</li>
        <li>
          <strong>theme_color</strong> — color of the system status bar / window chrome when the installed app is open
        </li>
        <li>
          <strong>background_color</strong> — what the OS shows in the brief moment between tap-icon and app-loaded
        </li>
        <li>
          <strong>display: standalone</strong> — open in its own window with
          no browser address bar. <em>This is what makes it feel like an app
          instead of a webpage.</em>
        </li>
        <li>
          <strong>start_url</strong> — what URL the app opens to when launched
          from the home screen
        </li>
        <li>
          <strong>scope</strong> — defines what URLs are "inside" this app vs.
          "the rest of the web." Ours is <code>/meals/</code>, so navigation
          to a non-/meals URL would open in the system browser.
        </li>
        <li>
          <strong>icons</strong> — the 192x192 and 512x512 PNGs that get used
          everywhere (home screen, app switcher, splash screen, etc.). The{' '}
          <code>purpose: maskable</code> icon is for Android, which crops icons
          to a circle or squircle.
        </li>
      </ul>

      <h2>The service worker</h2>
      <p>
        A service worker is a JavaScript file that the browser registers and
        keeps alive in the background, separate from any open tab. It can:
      </p>
      <ul>
        <li>Cache assets so the app works offline</li>
        <li>Intercept network requests and serve from cache when offline</li>
        <li>Receive push notifications (we don't use this)</li>
        <li>Run background sync (we don't use this either)</li>
      </ul>
      <p>
        The plugin generates ours via <strong>Workbox</strong> (Google's SW
        toolkit). It precaches all the static files at build time, so the app
        works fully offline after the first visit. When you deploy a new
        version, the service worker detects it on next launch, downloads the
        new files, and auto-applies them. That's what <code>registerType:
        'autoUpdate'</code> does.
      </p>

      <h2>The navigateFallback gotcha</h2>
      <p>Look at this part of our config:</p>
      <pre><code>{`workbox: {
  navigateFallback: '/meals/index.html',
  navigateFallbackAllowlist: [/^\\/meals\\//]
}`}</code></pre>
      <p>
        This says: "if the user navigates to a URL we haven't seen, fall back
        to <code>/meals/index.html</code> — but only for URLs under{' '}
        <code>/meals/</code>." Why? Because in our setup, the landing page at{' '}
        <code>/</code> is a separate site, not part of the SPA. We don't want
        the service worker to intercept landing-page requests and serve the
        SPA shell.
      </p>

      <h2>"Add to Home Screen" on iPhone vs Android</h2>
      <p>
        Both work, with subtle differences:
      </p>
      <ul>
        <li>
          <strong>Android (Chrome)</strong>: when the manifest is valid, Chrome
          shows a banner offering to install. Or the user can tap the menu →
          "Add to Home screen."
        </li>
        <li>
          <strong>iOS (Safari or Chrome on recent iOS)</strong>: Share button →
          "Add to Home Screen." iOS doesn't pop a banner; the user has to know
          to do it. That's why INSTALL.md in the repo walks family members
          through it.
        </li>
      </ul>
      <p>iOS has historically been the trickier platform for PWAs (limited features, weird quirks). It's improved a lot in recent years.</p>

      <h2>Things PWAs still can't do (vs native apps)</h2>
      <ul>
        <li>
          Live in the App Store (you have to share a URL — easy for family,
          harder for a broader audience)
        </li>
        <li>
          Get full access to native features like contacts, biometrics, or
          deep iOS notification customization
        </li>
        <li>
          Survive iOS's data-eviction policy in some edge cases (apps that
          aren't used for ~7 weeks can have their cache cleared)
        </li>
      </ul>
      <p>
        For a family meal planner: not a problem. For a fitness tracker that
        needs HealthKit: would need to be native. For most things: PWA is
        fine, and you save a Mac + $99/year + the App Store review cycle.
      </p>

      <Quiz
        questions={[
          {
            q: "What single thing in the manifest is most responsible for the app feeling 'native' instead of 'web' when launched from the home screen?",
            choices: [
              "theme_color",
              "icons",
              "display: standalone — opens the app in its own window with no browser address bar",
              "start_url",
            ],
            correct: 2,
            explanation: "Standalone display mode is the difference between 'I tapped an icon and got a webpage in Safari' and 'I tapped an icon and got an app.' No address bar, no Safari UI, just your app.",
          },
          {
            q: "What does a service worker mainly do for the Dinner App?",
            choices: [
              "Sends push notifications",
              "Caches the static assets so the app works offline and starts instantly on repeat visits",
              "Talks directly to Firestore",
              "Replaces React",
            ],
            correct: 1,
            explanation: "Our SW is doing precaching — it stashes the bundled JS/CSS/icons after first visit, so subsequent loads are instant and the UI works without internet. We don't use push notifications, sync, or other advanced SW features.",
          },
          {
            q: "Why is the navigateFallback restricted to URLs under /meals/ instead of being app-wide?",
            choices: [
              "Performance optimization",
              "Because the landing page at / is a separate static site, and we don't want the service worker hijacking navigation to it",
              "Random Workbox quirk",
              "Required by iOS",
            ],
            correct: 1,
            explanation: "The fallback rule essentially says 'for any URL I don't have a cached file for, serve the SPA shell.' We only want that behavior for /meals/* URLs (the Dinner App). Without the allowlist, navigating to / would serve the React app instead of the landing.",
          },
          {
            q: "When you deploy a new version of the app, how do already-installed PWAs on family phones get the update?",
            choices: [
              "They don't until manually reinstalled",
              "registerType: 'autoUpdate' makes the service worker detect new versions on launch, fetch them, and switch over — usually one foreground load behind",
              "Apple pushes an update through the App Store",
              "It's instant for everyone",
            ],
            correct: 1,
            explanation: "Auto-update is built in via the plugin config. Sometimes the user needs to relaunch the app once to get the new version (iOS in particular can be lazy about checking). For changes you want users to see immediately, mention it — but for most cosmetic/incremental updates, they just appear over time.",
          },
        ]}
      />
    </>
  )
}
