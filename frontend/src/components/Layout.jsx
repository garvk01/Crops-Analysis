import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard',    icon: '🏠' },
  { path: '/upload',  label: 'New Analysis', icon: '➕' },
  { path: '/history', label: 'My Datasets',  icon: '📂' },
]

const PAGE_TITLES = {
  '/':         'Dashboard',
  '/upload':   'New Analysis',
  '/history':  'My Datasets',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k) && (k !== '/' || pathname === '/'))?.[1] || 'Analysis'

  return (
    <div className={styles.app}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="white" width={20} height={20}>
              <path d="M17 8C8 10 5.9 16.17 3.82 22H5C5.5 20.5 7 17 12 15c3.71-.78 6.02-3.5 7.06-7L17 8zM5.5 6.5C4.67 5.87 4 5 4 4a4 4 0 018 0c0 1-.67 1.87-1.5 2.5C9.5 7.87 9 9 9 10H7c0-1-.5-2.13-1.5-3.5z"/>
            </svg>
          </div>
          <div>
            <div className={styles.logoText}>CropCycle</div>
            <div className={styles.logoSub}>Analysis System</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Navigation</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.userChip}>
            <div className={styles.avatar}>{(user?.name || 'U')[0]}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>Researcher</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>{title}</span>
          <span className={styles.statusBadge}>
            <span className={styles.statusDot} /> Live
          </span>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
