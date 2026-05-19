import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import LessonChrome from './components/LessonChrome.jsx'
import Home from './pages/Home.jsx'
import { findLesson } from './lessons/index.js'

function LessonRoute() {
  const { slug } = useParams()
  const lesson = findLesson(slug)
  if (!lesson) return <Navigate to="/" replace />
  const Lesson = lesson.component
  return (
    <LessonChrome lesson={lesson}>
      <Lesson />
    </LessonChrome>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lessons/:slug" element={<LessonRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
