import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "../src/components/Global/ProtectedRoute"
import { AuthProvider } from './context/AuthContext/AuthContext'
import Home from "./pages/Home"
import MagicLinkAuth from "./pages/MagicLinkAuth"
import Onboarding from "./pages/Onboarding"
import Profile from "./pages/Profile"
import Search from "./pages/Search"
import Space from "./pages/Space"
import ThreadlyLogin from "./pages/SpaceLogin"
import SpaceSettings from "./pages/SpaceSettings"

const ProtectedRoutes = (path, component) => (
  <Route path={path} element={<ProtectedRoute requireOnboarding={true}>{component}</ProtectedRoute>} />
);

const OnboardingRoute = (path, component) => (
  <Route path={path} element={<ProtectedRoute requireOnboarding={false}>{component}</ProtectedRoute>} />
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<ThreadlyLogin />} />
        <Route path="/auth/magic-link" element={<MagicLinkAuth />} />
        {ProtectedRoutes("/home", <Home />)}
        {OnboardingRoute("/onboarding", <Onboarding />)}
        {ProtectedRoutes("/spaces/:spaceId", <Space />)}
        {ProtectedRoutes("/spaces/:spaceId/settings", <SpaceSettings />)}
        {ProtectedRoutes("/search", <Search />)}
        {ProtectedRoutes("/profile/:username", <Profile />)}
      </Routes>
    </AuthProvider>
  )
}

export default App