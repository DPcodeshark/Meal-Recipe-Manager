import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { FamilyProvider, useFamily } from './context/FamilyContext'
import NavBar from './components/NavBar'
import KeepAlive from './components/KeepAlive'
import Login from './pages/Login'
import WeekView from './pages/WeekView'
import DayDetail from './pages/DayDetail'
import MealLibrary from './pages/MealLibrary'
import GroceryList from './pages/GroceryList'
import Pantry from './pages/Pantry'
import Settings from './pages/Settings'
import './App.css'

const KEPT_ROUTES = [
  { path: '/', component: WeekView },
  { path: '/meals', component: MealLibrary },
  { path: '/grocery', component: GroceryList },
  { path: '/pantry', component: Pantry },
  { path: '/settings', component: Settings },
]

function AppRoutes() {
  const { familyId, currentMember, loading } = useFamily()
  const location = useLocation()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!familyId || !currentMember) {
    return <Login />
  }

  const isDayDetail = location.pathname.startsWith('/day/')

  return (
    <div className="app-shell">
      <main className="main-content">
        {KEPT_ROUTES.map(({ path, component: Component }) => (
          <KeepAlive key={path} path={path}>
            <Component />
          </KeepAlive>
        ))}
        {isDayDetail && (
          <Routes location={location}>
            <Route path="/day/:date" element={<DayDetail />} />
          </Routes>
        )}
        {!isDayDetail && !KEPT_ROUTES.some(r => r.path === location.pathname) && (
          <Routes location={location}>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </main>
      <NavBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/meals">
      <FamilyProvider>
        <AppRoutes />
      </FamilyProvider>
    </BrowserRouter>
  )
}
