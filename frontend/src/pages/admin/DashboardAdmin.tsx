import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const response = await api.get('/admin/stats');
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
          <h1 className="text-xl font-bold text-green-700">UNCHK — Administration</h1>
          <div className="flex items-center gap-4">
            <Link to="/admin/entreprises" className="text-sm text-gray-600 hover:text-green-700 font-medium">
              Entreprises
            </Link>
            <Link to="/admin/utilisateurs" className="text-sm text-gray-600 hover:text-green-700 font-medium">
              Utilisateurs
            </Link>
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
              admin
            </span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Tableau de bord administrateur</h2>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-gray-800">{stats?.totalEtudiants}</p>
                <p className="text-gray-500 text-sm mt-1">Étudiants</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-blue-600">{stats?.totalEntreprises}</p>
                <p className="text-gray-500 text-sm mt-1">Entreprises</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-600">{stats?.offresPubliees}</p>
                <p className="text-gray-500 text-sm mt-1">Offres publiées</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-purple-600">{stats?.totalCandidatures}</p>
                <p className="text-gray-500 text-sm mt-1">Candidatures</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-orange-500">{stats?.totalOffres}</p>
                <p className="text-gray-500 text-sm mt-1">Total offres</p>
              </div>
              <div className={`bg-white rounded-xl border shadow-sm p-5 ${stats?.entreprisesEnAttente > 0 ? 'border-yellow-300' : 'border-gray-100'}`}>
                <p className="text-3xl font-bold text-yellow-500">{stats?.entreprisesEnAttente}</p>
                <p className="text-gray-500 text-sm mt-1">En attente validation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/admin/entreprises"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="font-semibold text-gray-800 mb-1">Gérer les entreprises</h3>
                <p className="text-gray-500 text-sm">Valider, rejeter et gérer les comptes entreprises</p>
                {stats?.entreprisesEnAttente > 0 && (
                  <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {stats.entreprisesEnAttente} en attente
                  </span>
                )}
              </Link>
              <Link to="/admin/utilisateurs"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-800 mb-1">Gérer les utilisateurs</h3>
                <p className="text-gray-500 text-sm">Activer, désactiver et gérer tous les comptes</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}