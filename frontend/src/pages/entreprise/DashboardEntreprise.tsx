import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Offre {
  id: string;
  titre: string;
  typeOffre: string;
  statut: string;
  localisation: string;
  dateCreation: string;
  dateLimiteCandidature: string;
  nombrePostes: number;
}

const statutColors: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  soumis: 'bg-yellow-100 text-yellow-700',
  valide: 'bg-blue-100 text-blue-700',
  publie: 'bg-green-100 text-green-700',
  ferme: 'bg-red-100 text-red-700',
};

export default function DashboardEntreprise() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerOffres();
  }, []);

  const chargerOffres = async () => {
    try {
      const response = await api.get('/offres/mes-offres');
      setOffres(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: offres.length,
    publiees: offres.filter(o => o.statut === 'publie').length,
    brouillons: offres.filter(o => o.statut === 'brouillon').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK — Entreprise</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
              entreprise
            </span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Mes offres</h2>
            <p className="text-gray-500">Gérez vos offres et candidatures</p>
          </div>
          <Link
            to="/entreprise/creer-offre"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            + Nouvelle offre
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-gray-500 text-sm mt-1">Total offres</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-green-600">{stats.publiees}</p>
            <p className="text-gray-500 text-sm mt-1">Publiées</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-gray-400">{stats.brouillons}</p>
            <p className="text-gray-500 text-sm mt-1">Brouillons</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : offres.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore créé d'offre.</p>
            <Link to="/entreprise/creer-offre" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition">
              Créer une offre
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offres.map((offre) => (
              <div key={offre.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{offre.titre}</h3>
                    <p className="text-gray-500 text-sm">{offre.localisation} • {offre.typeOffre}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statutColors[offre.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {offre.statut}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Créée le {new Date(offre.dateCreation).toLocaleDateString('fr-FR')} •
                    Limite : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to={`/entreprise/offres/${offre.id}/candidatures`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Voir candidatures
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}