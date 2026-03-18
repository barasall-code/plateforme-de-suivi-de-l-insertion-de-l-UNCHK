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
import ModifierOffre from './pages/entreprise/ModifierOffre';
import CandidaturesOffre from './pages/entreprise/CandidaturesOffre';
import ProfilEntreprise from './pages/entreprise/ProfilEntreprise';
import ProfilCandidat from './pages/entreprise/ProfilCandidat';
import MonProfil from './pages/profil/MonProfil';
import StatutProfessionnel from './pages/profil/StatutProfessionnel';
import MesCompetences from './pages/profil/MesCompetences';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import GestionEntreprises from './pages/admin/GestionEntreprises';
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs';
import GestionOffres from './pages/admin/GestionOffres';
import GestionSuperviseurs from './pages/admin/GestionSuperviseurs';
import GestionSupervisions from './pages/admin/GestionSupervisions';
import DashboardSuperviseur from './pages/superviseur/DashboardSuperviseur';
import MesEtudiants from './pages/superviseur/MesEtudiants';
import DetailEtudiant from './pages/superviseur/DetailEtudiant';
import ProfilSuperviseur from './pages/superviseur/ProfilSuperviseur';
import LandingPage from './pages/LandingPage';
import Messagerie from './pages/messagerie/Messagerie';
import VerifierEmail from './pages/auth/VerifierEmail';
import EmailEnvoye from './pages/auth/EmailEnvoye';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'entreprise') return <Navigate to="/entreprise/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'superviseur') return <Navigate to="/superviseur/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'entreprise') return <Navigate to="/entreprise/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'superviseur') return <Navigate to="/superviseur/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verifier-email" element={<VerifierEmail />} />
        <Route path="/email-envoye" element={<EmailEnvoye />} />
        <Route path="/register" element={<Register />} />

          {/* Routes étudiant */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['etudiant']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/offres" element={
            <ProtectedRoute roles={['etudiant', 'superviseur']}>
              <ListeOffres />
            </ProtectedRoute>
          } />
          <Route path="/offres/:id" element={
            <ProtectedRoute roles={['etudiant', 'superviseur', 'admin']}>
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
          <Route path="/statut-professionnel" element={
            <ProtectedRoute roles={['etudiant']}>
              <StatutProfessionnel />
            </ProtectedRoute>
          } />
          <Route path="/competences" element={
            <ProtectedRoute roles={['etudiant']}>
              <MesCompetences />
            </ProtectedRoute>
          } />

          {/* Routes entreprise */}
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
          <Route path="/entreprise/offres/:offreId/modifier" element={
            <ProtectedRoute roles={['entreprise']}>
              <ModifierOffre />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/offres/:offreId/candidatures" element={
            <ProtectedRoute roles={['entreprise']}>
              <CandidaturesOffre />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/candidatures/:candidatureId/profil" element={
            <ProtectedRoute roles={['entreprise']}>
              <ProfilCandidat />
            </ProtectedRoute>
          } />

          {/* Routes admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/offres" element={<GestionOffres />} />
        <Route path="/admin/entreprises" element={
            <ProtectedRoute roles={['admin']}>
              <GestionEntreprises />
            </ProtectedRoute>
          } />
          <Route path="/admin/utilisateurs" element={
            <ProtectedRoute roles={['admin']}>
              <GestionUtilisateurs />
            </ProtectedRoute>
          } />
          <Route path="/admin/offres" element={
            <ProtectedRoute roles={['admin']}>
              <GestionOffres />
            </ProtectedRoute>
          } />
          <Route path="/admin/superviseurs" element={
            <ProtectedRoute roles={['admin']}>
              <GestionSuperviseurs />
            </ProtectedRoute>
          } />
          <Route path="/admin/supervisions" element={
            <ProtectedRoute roles={['admin']}>
              <GestionSupervisions />
            </ProtectedRoute>
          } />

          {/* Routes superviseur */}
          <Route path="/superviseur/dashboard" element={
            <ProtectedRoute roles={['superviseur']}>
              <DashboardSuperviseur />
            </ProtectedRoute>
          } />
          <Route path="/superviseur/etudiants" element={
            <ProtectedRoute roles={['superviseur']}>
              <MesEtudiants />
            </ProtectedRoute>
          } />
          <Route path="/superviseur/etudiants/:etudiantId" element={
            <ProtectedRoute roles={['superviseur']}>
              <DetailEtudiant />
            </ProtectedRoute>
          } />
          <Route path="/superviseur/profil" element={
            <ProtectedRoute roles={['superviseur']}>
              <ProfilSuperviseur />
            </ProtectedRoute>
          } />
          <Route path="/messagerie" element={
            <ProtectedRoute roles={['etudiant', 'entreprise']}>
              <Messagerie />
            </ProtectedRoute>
          } />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;