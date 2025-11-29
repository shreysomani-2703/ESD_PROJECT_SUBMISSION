
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import OAuthRedirect from './pages/OAuthRedirect'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* protected routes — any child route here requires auth */}
        <Route element={<ProtectedRoute autoRedirect={false} />}>
          <Route path="/" element={<MainPage />} />
          {/* add other protected routes here, e.g.:
              <Route path="/students" element={<StudentsPage />} />
          */}
        </Route>

        {/* fallback: redirect unknown routes to home (or a 404 page) */}
        <Route path="*" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  )
}
