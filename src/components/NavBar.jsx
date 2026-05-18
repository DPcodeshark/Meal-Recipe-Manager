import { NavLink } from 'react-router-dom'
import { Calendar, BookOpen, ShoppingCart, Package, Settings } from 'lucide-react'

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <NavLink to="/" className="nav-item" end>
        <Calendar size={20} />
        <span>Plan</span>
      </NavLink>
      <NavLink to="/meals" className="nav-item">
        <BookOpen size={20} />
        <span>Meals</span>
      </NavLink>
      <NavLink to="/grocery" className="nav-item">
        <ShoppingCart size={20} />
        <span>List</span>
      </NavLink>
      <NavLink to="/pantry" className="nav-item">
        <Package size={20} />
        <span>Pantry</span>
      </NavLink>
      <NavLink to="/settings" className="nav-item">
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  )
}
