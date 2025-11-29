import { useEffect, useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { getUserInfo, login } from '../controller/auth'

/**
 * ProtectedRoute
 *
 * - If authenticated: renders the nested route(s) via <Outlet />
 * - While checking auth: shows a simple loading indicator
 * - If not authenticated: navigates to /login (so user can click Login),
 *   or automatically starts the OAuth flow by calling login() if `autoRedirect` is true.
 *
 * Usage:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/" element={<MainPage />} />
 * </Route>
 */
export default function ProtectedRoute({ autoRedirect = false }: { autoRedirect?: boolean }) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    const check = async () => {
      setChecking(true)
      try {
        const user = await getUserInfo()
        if (!mounted) return
        setAuthenticated(Boolean(user))
        // If not authenticated and autoRedirect is true, immediately start login redirect.
        if (!user && autoRedirect) {
          // start OAuth flow (full-page redirect)
          login('google')
        }
      } catch (err) {
        console.error('ProtectedRoute getUserInfo error', err)
        setAuthenticated(false)
      } finally {
        if (mounted) setChecking(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [autoRedirect, location.pathname])

  if (checking) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Checking authentication…</p>
      </div>
    )
  }

  if (!authenticated) {
    // send to a login page so the user can click "Login" — preserves nicer UX than forcing redirect
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Authenticated: render child routes
  return <Outlet />
}
