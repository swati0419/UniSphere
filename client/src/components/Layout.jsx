import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#6d4ce8" />
            <circle cx="11" cy="8" r="3" fill="white" />
            <path d="M5 17c0-3 2.5-5 6-5s6 2 6 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className={styles.brandName}>UniSphere</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Feed</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Events</NavLink>
          <NavLink to="/resources" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Resources</NavLink>
          <NavLink to="/forum" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Forum</NavLink>
          <NavLink to="/study-groups" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Study Groups</NavLink>
          <div className={styles.userWrap}>
            {user?.role === 'admin' && <span className={styles.adminBadge}>Admin</span>}
            <span className={styles.userName}>👤 {user?.name}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
} 
