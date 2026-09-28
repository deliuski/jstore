import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Footer } from '../Footer/Footer'
import { Header } from '../Header/Header'

/** Scrolls to `#hash` targets, and back to the top when the page changes. */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
}

export function Layout() {
  useScrollOnNavigate()

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
