import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ListeOffres from './pages/offres/ListeOffres';
import DetailOffre from './pages/offres/DetailOffre';
import MesCandidatures from './pages/candidatures/MesCandidatures';
import DashboardEntreprise from './pages/entreprise/DashboardEntreprise';
import CreerOffre from './pages/entreprise/CreerOffre';
import CandidaturesOffre from './pages/entreprise/CandidaturesOffre';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/offres" element={
            <ProtectedRoute><ListeOffres /></ProtectedRoute>
          } />
          <Route path="/offres/:id" element={
            <ProtectedRoute><DetailOffre /></ProtectedRoute>
          } />
          <Route path="/candidatures" element={
            <ProtectedRoute><MesCandidatures /></ProtectedRoute>
          } />
          <Route path="/entreprise/dashboard" element={
            <ProtectedRoute><DashboardEntreprise /></ProtectedRoute>
          } />
          <Route path="/entreprise/creer-offre" element={
            <ProtectedRoute><CreerOffre /></ProtectedRoute>
          } />
          <Route path="/entreprise/offres/:offreId/candidatures" element={
            <ProtectedRoute><CandidaturesOffre /></ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;