// Registry of all lessons in order. The slug becomes the URL segment.
// Add new lessons by importing them here and appending to the array.
import Welcome from './01-welcome.jsx'
import Architecture from './02-architecture.jsx'
import Tools from './03-tools.jsx'
import Codebase from './04-codebase.jsx'
import Stack from './05-stack.jsx'
import RunningLocally from './06-running-locally.jsx'
import DataLayer from './07-data-layer.jsx'
import Hosting from './08-hosting.jsx'
import CloudFunctions from './09-cloud-functions.jsx'
import PWA from './10-pwa.jsx'
import ClaudePart1 from './11-claude-part-1.jsx'
import ClaudePart2 from './12-claude-part-2.jsx'
import Maintaining from './13-maintaining.jsx'
import WhereNext from './14-where-next.jsx'

export const LESSONS = [
  { slug: 'welcome', title: 'Welcome', subtitle: 'Why we built this, what you’ll get out of it', component: Welcome },
  { slug: 'architecture', title: 'The Big Picture', subtitle: 'What a web app actually is, in five pieces', component: Architecture },
  { slug: 'tools', title: 'The Tools', subtitle: 'What to install on your machine — and why', component: Tools },
  { slug: 'codebase', title: 'The Codebase', subtitle: 'A guided tour of the repo', component: Codebase },
  { slug: 'stack', title: 'The Stack at a Glance', subtitle: 'React, Vite, Firebase — what each piece does', component: Stack },
  { slug: 'running-locally', title: 'Running it Locally', subtitle: 'Clone, install, dev server, demo mode', component: RunningLocally },
  { slug: 'data-layer', title: 'The Data Layer', subtitle: 'Firestore basics + how auth works in this app', component: DataLayer },
  { slug: 'hosting', title: 'Hosting & Deploys', subtitle: 'Firebase Hosting, custom domains, the deploy command', component: Hosting },
  { slug: 'cloud-functions', title: 'Cloud Functions', subtitle: 'When and why to put logic on the server', component: CloudFunctions },
  { slug: 'pwa', title: 'PWA Basics', subtitle: 'Manifest, service worker, "Add to Home Screen"', component: PWA },
  { slug: 'claude-1', title: 'Working with Claude, Part 1', subtitle: 'When to delegate, and how to ask', component: ClaudePart1 },
  { slug: 'claude-2', title: 'Working with Claude, Part 2', subtitle: 'Reviewing diffs, pushing back, iterating', component: ClaudePart2 },
  { slug: 'maintaining', title: 'Maintaining the App', subtitle: 'Shipping changes, debugging, rolling back', component: Maintaining },
  { slug: 'where-next', title: 'Where to Go Next', subtitle: 'Build something. Read other code. Ship.', component: WhereNext },
]

export function findLesson(slug) {
  const idx = LESSONS.findIndex(l => l.slug === slug)
  if (idx === -1) return null
  return {
    ...LESSONS[idx],
    index: idx,
    prev: idx > 0 ? LESSONS[idx - 1] : null,
    next: idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null,
  }
}
