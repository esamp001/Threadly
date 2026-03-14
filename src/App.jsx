import { Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from './context/AuthContext/AuthContext'
import Home from "./pages/Home"
import ThreadlyLogin from "./pages/SpaceLogin"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<ThreadlyLogin />} />
      </Routes>
    </AuthProvider>
  )
}

export default App