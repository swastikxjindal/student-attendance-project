import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['user1']} />}>
                <Route path="/dashboard/*" element={<UserDashboard />} />
                <Route path="/profile" element={<UserDashboard />} />
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <ToastContainer theme="dark" position="top-right" />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
