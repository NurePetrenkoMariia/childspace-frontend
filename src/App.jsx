import './App.css'
import { AuthProvider } from "./auth/AuthContext"
import LoginPage from "./pages/Login/LoginPage"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SubjectDetailsPage from './pages/SubjectDetailsPage/SubjectDetailsPage'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import ChatsPage from './pages/ChatsPage/ChatsPage'

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={
            <Layout />
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subject/:id" element={<SubjectDetailsPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/chats" element={<ChatsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
