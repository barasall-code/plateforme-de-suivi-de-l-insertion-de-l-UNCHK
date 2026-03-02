import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Notifications from '../../components/Notifications';
import api from '../../services/api';

export default function DashboardSuperviseur() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const response = await api.get('/superviseur/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK — Superviseur</h1>
          <div className="flex items-center gap-4">
            <Link to="/superviseur/etudiants" className="text-sm text-gray-600 hover:text-green-700 font-medium">
              Mes étudiants
            </Link>
            <Link to="/offres" className="text-sm text-gray-600 hover:text-green-700 font-medium">
              Offres
            </Link>
            <Notifications />
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
              superviseur
            </span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h2>
        <p className="text-gray-500 mb-8">Suivi de l'insertion professionnelle de vos étudiants</p>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-gray-800">{stats?.totalEtudiants}</p>
                <p className="text-gray-500 text-sm mt-1">Étudiants suivis</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-blue-600">{stats?.etudiantsActifs}</p>
                <p className="text-gray-500 text-sm mt-1">Supervisions actives</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-purple-600">{stats?.totalCandidatures}</p>
                <p className="text-gray-500 text-sm mt-1">Total candidatures</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-yellow-500">{stats?.candidaturesEnCours}</p>
                <p className="text-gray-500 text-sm mt-1">En cours</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-600">{stats?.candidaturesAcceptees}</p>
                <p className="text-gray-500 text-sm mt-1">Acceptées</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-700">{stats?.tauxInsertion}%</p>
                <p className="text-gray-500 text-sm mt-1">Taux d'insertion</p>
              </div>
            </div>

            {/* Navigation rapide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/superviseur/etudiants"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-800 mb-1">Mes étudiants</h3>
                <p className="text-gray-500 text-sm">Suivez le parcours d'insertion de vos étudiants</p>
                <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {stats?.totalEtudiants} étudiant{stats?.totalEtudiants > 1 ? 's' : ''}
                </span>
              </Link>
              <Link to="/offres"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-800 mb-1">Offres disponibles</h3>
                <p className="text-gray-500 text-sm">Consultez les offres de stage et d'emploi</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}