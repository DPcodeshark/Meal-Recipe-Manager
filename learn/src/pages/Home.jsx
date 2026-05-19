import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Wrench, Map } from 'lucide-react'
import { LESSONS } from '../lessons/index.js'

export default function Home() {
  const first = LESSONS[0]
  return (
    <div className="home">
      <header className="home-hero">
        <span className="home-eyebrow">A short course for the Zavod nephews</span>
        <h1>How the Dinner App works <br/>— and how to keep it working.</h1>
        <p className="home-lede">
          A real, deployed family app built with Claude Code. Twelve-ish lessons
          on the stack, the deploy pipeline, and how to collaborate with Claude
          to keep things shipping.
        </p>
        <div className="home-cta">
          <Link to={`/lessons/${first.slug}`} className="home-cta-primary">
            Start with <strong>{first.title}</strong> <ArrowRight size={16} />
          </Link>
          <a
            href="https://zavods.com/meals"
            className="home-cta-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            See the app
          </a>
        </div>
      </header>

      <section className="home-pitches">
        <div className="home-pitch">
          <span className="home-pitch-icon"><Map size={20} /></span>
          <h3>Concrete, not abstract</h3>
          <p>Every concept points at a real file in the real codebase. No toy examples.</p>
        </div>
        <div className="home-pitch">
          <span className="home-pitch-icon"><Wrench size={20} /></span>
          <h3>Stack you'll actually use</h3>
          <p>React, Vite, Firebase, Cloud Functions, PWA basics, deploy plumbing.</p>
        </div>
        <div className="home-pitch">
          <span className="home-pitch-icon"><Sparkles size={20} /></span>
          <h3>How to work with Claude</h3>
          <p>When to delegate, how to prompt for diffs, how to review what came back.</p>
        </div>
      </section>

      <section className="home-toc">
        <h2>The curriculum</h2>
        <ol className="home-lesson-list">
          {LESSONS.map((l, i) => (
            <li key={l.slug}>
              <Link to={`/lessons/${l.slug}`} className="home-lesson-link">
                <span className="home-lesson-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="home-lesson-meta">
                  <strong>{l.title}</strong>
                  <em>{l.subtitle}</em>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="home-toc-note">More lessons land as we go. Skim what's interesting; skip what's familiar.</p>
      </section>
    </div>
  )
}
