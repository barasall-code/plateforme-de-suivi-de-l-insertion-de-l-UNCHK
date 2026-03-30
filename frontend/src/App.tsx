import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
          <div className="text-5xl mb-4"><i className="fa-solid fa-triangle-exclamation text-yellow-500"></i></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Une erreur est survenue</h1>
          <p className="text-gray-500 text-sm mb-6 max-w-md">{(this.state.error as Error).message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DashboardDiplome from './pages/diplome/DashboardDiplome';
import DashboardDirection from './pages/direction/DashboardDirection';
import RechercheProfiles from './pages/entreprise/RechercheProfiles';
import MarqueEmployeur from './pages/entreprise/MarqueEmployeur';
import IndicateursPedagogiques from './pages/superviseur/IndicateursPedagogiques';
import ListeOffres from './pages/offres/ListeOffres';
import DetailOffre from './pages/offres/DetailOffre';
import MesCandidatures from './pages/candidatures/MesCandidatures';
import DashboardEntreprise from './pages/entreprise/DashboardEntreprise';
import CreerOffre from './pages/entreprise/CreerOffre';
import ModifierOffre from './pages/entreprise/ModifierOffre';
import CandidaturesOffre from './pages/entreprise/CandidaturesOffre';
import ProfilEntreprise from './pages/entreprise/ProfilEntreprise';
import ProfilCandidat from './pages/entreprise/ProfilCandidat';
import MesCandidaturesEntreprise from './pages/entreprise/MesCandidaturesEntreprise';
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
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
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
    if (user.role === 'diplome') return <Navigate to="/diplome/dashboard" replace />;
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
      <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verifier-email" element={<VerifierEmail />} />
        <Route path="/email-envoye" element={<EmailEnvoye />} />
        <Route path="/register" element={<Register />} />

          {/* Routes étudiant */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['etudiant', 'diplome']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/offres" element={
            <ProtectedRoute roles={['etudiant', 'diplome', 'superviseur']}>
              <ListeOffres />
            </ProtectedRoute>
          } />
          <Route path="/offres/:id" element={
            <ProtectedRoute roles={['etudiant', 'diplome', 'superviseur', 'admin']}>
              <DetailOffre />
            </ProtectedRoute>
          } />
          <Route path="/candidatures" element={
            <ProtectedRoute roles={['etudiant', 'diplome']}>
              <MesCandidatures />
            </ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute roles={['etudiant', 'diplome']}>
              <MonProfil />
            </ProtectedRoute>
          } />
          <Route path="/statut-professionnel" element={
            <ProtectedRoute roles={['etudiant', 'diplome']}>
              <StatutProfessionnel />
            </ProtectedRoute>
          } />
          <Route path="/competences" element={
            <ProtectedRoute roles={['etudiant', 'diplome']}>
              <MesCompetences />
            </ProtectedRoute>
          } />

          {/* Routes entreprise */}
          <Route path="/direction/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardDirection />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/profils" element={
            <ProtectedRoute roles={['entreprise']}>
              <RechercheProfiles />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/marque" element={
            <ProtectedRoute roles={['entreprise']}>
              <MarqueEmployeur />
            </ProtectedRoute>
          } />
          <Route path="/superviseur/indicateurs" element={
            <ProtectedRoute roles={['superviseur', 'admin']}>
              <IndicateursPedagogiques />
            </ProtectedRoute>
          } />
          <Route path="/diplome/dashboard" element={
            <ProtectedRoute roles={['diplome']}>
              <DashboardDiplome />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/dashboard" element={
            <ProtectedRoute roles={['entreprise']}>
              <DashboardEntreprise />
            </ProtectedRoute>
          } />
          <Route path="/entreprise/candidatures" element={
            <ProtectedRoute roles={['entreprise']}>
              <MesCandidaturesEntreprise />
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
            <ProtectedRoute roles={['etudiant', 'diplome', 'entreprise']}>
              <Messagerie />
            </ProtectedRoute>
          } />
          <Route path="/" element={<LandingPage />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;