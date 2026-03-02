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
import ProfilEntreprise from './pages/entreprise/ProfilEntreprise';
import MonProfil from './pages/profil/MonProfil';
import ProfilCandidat from './pages/entreprise/ProfilCandidат';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'entreprise') return <Navigate to="/entreprise/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'entreprise') return <Navigate to="/entreprise/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['etudiant', 'admin', 'superviseur']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/offres" element={
            <ProtectedRoute roles={['etudiant', 'admin', 'superviseur']}>
              <ListeOffres />
            </ProtectedRoute>
          } />
          <Route path="/offres/:id" element={
            <ProtectedRoute roles={['etudiant', 'admin', 'superviseur']}>
              <DetailOffre />
            </ProtectedRoute>
          } />
          <Route path="/candidatures" element={
            <ProtectedRoute roles={['etudiant']}>
              <MesCandidatures />
            </ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute roles={['etudiant']}>
              <MonProfil />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/candidatures/:candidatureId/profil" element={
  <ProtectedRoute roles={['entreprise']}>
    <ProfilCandidat />
  </ProtectedRoute>
} />
          <Route path="/entreprise/dashboard" element={
            <ProtectedRoute roles={['entreprise']}>
              <DashboardEntreprise />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/profil" element={
            <ProtectedRoute roles={['entreprise']}>
              <ProfilEntreprise />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/creer-offre" element={
            <ProtectedRoute roles={['entreprise']}>
              <CreerOffre />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/offres/:offreId/candidatures" element={
            <ProtectedRoute roles={['entreprise']}>
              <CandidaturesOffre />
            </ProtectedRoute>
          } />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;