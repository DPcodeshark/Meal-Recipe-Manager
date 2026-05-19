import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function LessonChrome({ lesson, children }) {
  return (
    <article className="lesson">
      <header className="lesson-header">
        <span className="lesson-pill">Lesson {String(lesson.index + 1).padStart(2, '0')}</span>
        <h1>{lesson.title}</h1>
        {lesson.subtitle && <p className="lesson-subtitle">{lesson.subtitle}</p>}
      </header>

      <div className="lesson-body">{children}</div>

      <nav className="lesson-nav-footer">
        {lesson.prev ? (
          <Link to={`/lessons/${lesson.prev.slug}`} className="lesson-prev">
            <ChevronLeft size={16} />
            <span>
              <span className="lesson-nav-direction">Previous</span>
              <strong>{lesson.prev.title}</strong>
            </span>
          </Link>
        ) : <span />}
        {lesson.next ? (
          <Link to={`/lessons/${lesson.next.slug}`} className="lesson-next">
            <span>
              <span className="lesson-nav-direction">Next up</span>
              <strong>{lesson.next.title}</strong>
            </span>
            <ChevronRight size={16} />
          </Link>
        ) : <span />}
      </nav>
    </article>
  )
}
