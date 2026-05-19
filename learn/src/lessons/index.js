// Registry of all lessons in order. The slug becomes the URL segment.
// Add new lessons by importing them here and appending to the array.
import Welcome from './01-welcome.jsx'
import Architecture from './02-architecture.jsx'
import Tools from './03-tools.jsx'
import Codebase from './04-codebase.jsx'

export const LESSONS = [
  { slug: 'welcome', title: 'Welcome', subtitle: 'Why we built this, what you’ll get out of it', component: Welcome },
  { slug: 'architecture', title: 'The Big Picture', subtitle: 'What a web app actually is, in five pieces', component: Architecture },
  { slug: 'tools', title: 'The Tools', subtitle: 'What to install on your machine — and why', component: Tools },
  { slug: 'codebase', title: 'The Codebase', subtitle: 'A guided tour of the repo', component: Codebase },
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
