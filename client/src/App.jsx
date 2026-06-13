import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';

function ProtectedRoute({ children, requiredType }) {
  const { user, userType, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!user || userType !== requiredType) {
    return <Navigate to={`/login-${requiredType}`} replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user, userType } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        user ? (
          userType === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />
        ) : (
          <Navigate to="/login-admin" replace />
        )
      } />
      
      <Route path="/login-admin" element={
        user && userType === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
      } />
      
      <Route path="/login-user" element={
        user && userType === 'user' ? <Navigate to="/user/dashboard" replace /> : <UserLogin />
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredType="admin">
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/user/dashboard" element={
        <ProtectedRoute requiredType="user">
          <Layout>
            <UserDashboard />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;