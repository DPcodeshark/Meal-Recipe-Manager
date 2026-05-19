import { NavLink, Link } from 'react-router-dom'
import { ChefHat, BookOpen, GitBranch, ExternalLink, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { LESSONS } from '../lessons/index.js'

export default function Layout({ children }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="brand">
          <span className="brand-mark"><ChefHat size={18} /></span>
          <span className="brand-text">Zavods <em>Learn</em></span>
        </Link>
        <div className="layout-header-actions">
          <a
            href="https://zavods.com/meals"
            className="header-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="hide-on-mobile">Dinner App</span> <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/DPcodeshark/Meal-Recipe-Manager"
            className="header-link"
            target="_blank"
            rel="noopener noreferrer"
            title="View source on GitHub"
          >
            <GitBranch size={16} />
          </a>
          <button
            className="nav-toggle"
            onClick={() => setNavOpen(v => !v)}
            aria-label="Toggle navigation"
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="layout-body">
        <aside className={`layout-sidebar${navOpen ? ' open' : ''}`} onClick={() => setNavOpen(false)}>
          <p className="sidebar-label">Curriculum</p>
          <ol className="lesson-nav">
            {LESSONS.map((l, i) => (
              <li key={l.slug}>
                <NavLink
                  to={`/lessons/${l.slug}`}
                  className={({ isActive }) => `lesson-nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="lesson-nav-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lesson-nav-title">{l.title}</span>
                </NavLink>
              </li>
            ))}
          </ol>
          <p className="sidebar-footer">
            More lessons coming. Built with <a href="https://claude.com/claude-code">Claude Code</a>.
          </p>
        </aside>

        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  )
}
