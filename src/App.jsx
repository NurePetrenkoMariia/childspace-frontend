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
import SchedulePage from './pages/SchedulePage/SchedulePage'
import MaterialsPage from './pages/MaterialsPages/MaterialsPage'
import MaterialsDashboard from './pages/MaterialsPages/MaterialsDashboard'
import AttendancePage from './pages/AttendancePage/AttendancePage'

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subject/:id" element={<SubjectDetailsPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/materials" element={<MaterialsDashboard />} />
              <Route path="/materials/subject/:id" element={<MaterialsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
