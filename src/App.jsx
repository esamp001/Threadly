import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "../src/components/Global/ProtectedRoute"
import { AuthProvider } from './context/AuthContext/AuthContext'
import Home from "./pages/Home"
import Onboarding from "./pages/Onboarding"
import ThreadlyLogin from "./pages/SpaceLogin"

const ProtectedRoutes = (path, component) => {
  return (
    <Route
      path={path}
      element={
        <ProtectedRoute>
          {component}
        </ProtectedRoute>
      }
    />
  )
}


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<ThreadlyLogin />} />
        {ProtectedRoutes("/home", <Home />)}
        {ProtectedRoutes("/onboarding", <Onboarding />)}
      </Routes>
    </AuthProvider>
  )
}

export default App