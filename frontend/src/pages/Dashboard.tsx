import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from '../components/Notifications';
import api from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCandidatures: 0,
    soumises: 0,
    entretiens: 0,
    acceptees: 0,
    refusees: 0,
  });
  const [offresRecentes, setOffresRecentes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [candidaturesRes, offresRes] = await Promise.all([
        api.get('/candidatures/mes-candidatures'),
        api.get('/offres?page=1'),
      ]);

      const candidatures = candidaturesRes.data.data;
      setStats({
        totalCandidatures: candidatures.length,
        soumises: candidatures.filter((c: any) => c.statut === 'soumise').length,
        entretiens: candidatures.filter((c: any) => c.statut === 'entretien').length,
        acceptees: candidatures.filter((c: any) => c.statut === 'acceptee').length,
        refusees: candidatures.filter((c: any) => c.statut === 'refusee').length,
      });

      setOffresRecentes(offresRes.data.data.offres.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      stage: 'bg-blue-100 text-blue-700',
      alternance: 'bg-purple-100 text-purple-700',
      cdi: 'bg-green-100 text-green-700',
      cdd: 'bg-yellow-100 text-yellow-700',
      freelance: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK</h1>
          <div className="flex items-center gap-4">
            <Link to="/offres" className="text-sm text-gray-600 hover:text-green-700">Offres</Link>
            <Link to="/candidatures" className="text-sm text-gray-600 hover:text-green-700">Candidatures</Link>
            <Link to="/profil" className="text-sm text-gray-600 hover:text-green-700">Profil</Link>
            <Notifications />
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Bienvenue 👋</h2>
        <p className="text-gray-500 mb-8">Plateforme de suivi d'insertion professionnelle de l'UNCHK</p>

        {/* Stats candidatures */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.totalCandidatures}</p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.soumises}</p>
            <p className="text-xs text-gray-500 mt-1">Soumises</p>
          </div>
          <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.entretiens}</p>
            <p className="text-xs text-gray-500 mt-1">Entretiens</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.acceptees}</p>
            <p className="text-xs text-gray-500 mt-1">Acceptées</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.refusees}</p>
            <p className="text-xs text-gray-500 mt-1">Refusées</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/offres" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-800 mb-1">Offres disponibles</h3>
            <p className="text-gray-500 text-sm">Consultez les offres de stage et d'emploi</p>
          </Link>
          <Link to="/candidatures" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-800 mb-1">Mes candidatures</h3>
            <p className="text-gray-500 text-sm">Suivez l'état de vos candidatures</p>
          </Link>
          <Link to="/profil" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-semibold text-gray-800 mb-1">Mon profil</h3>
            <p className="text-gray-500 text-sm">Gérez vos informations personnelles</p>
          </Link>
        </div>

        {/* Offres récentes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Offres récentes</h3>
            <Link to="/offres" className="text-sm text-green-600 hover:text-green-700 font-medium">
              Voir tout →
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : offresRecentes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aucune offre disponible</div>
          ) : (
            <div className="space-y-3">
              {offresRecentes.map((offre) => (
                <Link key={offre.id} to={`/offres/${offre.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-green-300 transition block">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{offre.titre}</h4>
                      <p className="text-sm text-gray-500">{offre.entreprise.nomEntreprise} • {offre.localisation}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getBadgeColor(offre.typeOffre)}`}>
                      {offre.typeOffre}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}