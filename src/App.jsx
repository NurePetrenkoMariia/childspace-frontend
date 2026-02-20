import './App.css'
import { AuthProvider } from "./auth/AuthContext"
import LoginPage from "./pages/Login/LoginPage"

function App() {

  return (
    <>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </>
  )
}

export default App
