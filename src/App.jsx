import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './store/AppStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Faculty from './pages/Faculty'
import Subjects from './pages/Subjects'
import Classrooms from './pages/Classrooms'
import Batches from './pages/Batches'
import Timetable from './pages/Timetable'
import Settings from './pages/Settings'
import Login from './pages/Login'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('nexora_auth') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('nexora_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexora_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classrooms" element={<Classrooms />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
