
import { useLocation } from 'react-router-dom'
import { login } from '../controller/auth'

/**
 * LoginPage - a simple page the router can navigate to when auth is required.
 * The user can click the Login button to start the OAuth login flow.
 * Optionally you can automatically trigger login() on mount if you prefer.
 */
export default function LoginPage() {
  const location = useLocation()
  const from = (location.state && (location.state as any).from) || '/'

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 520, padding: 28, borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>Sign in required</h2>
        <p>To continue to <strong>{from?.pathname ?? '/'}</strong> you must sign in with Google.</p>
        <div style={{ marginTop: 16 }}>
          <button onClick={() => login('google')} className="auth-button">Login with Google</button>
        </div>
        <p style={{ marginTop: 12, color: '#666' }}>
          After signing in you'll be redirected back to the app.
        </p>
      </div>
    </div>
  )
}
