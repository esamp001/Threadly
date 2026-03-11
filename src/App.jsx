import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import ThreadlyLogin from "./pages/SpaceLogin"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<ThreadlyLogin />} />
    </Routes>
  )
}

export default App
