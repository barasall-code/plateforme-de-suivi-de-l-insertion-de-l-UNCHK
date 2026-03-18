import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BadgeMessages from '../../components/BadgeMessages';

interface Offre {
  id: string;
  titre: string;
  typeOffre: string;
  statut: string;
  localisation: string;
  dateCreation: string;
  dateLimiteCandidature: string;
  nombrePostes: number;
  _count?: { candidatures: number };
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
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoumettre = async (offreId: string) => {
    if (!confirm('Soumettre cette offre pour validation par l\'administrateur ?')) return;
    try {
      await api.post(`/offres/${offreId}/soumettre`);
      await chargerOffres();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission');
    }
  };

  const stats = {
    total: offres.length,
    publiees: offres.filter(o => o.statut === 'publie').length,
    brouillons: offres.filter(o => o.statut === 'brouillon').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/entreprise/offres/creer', label: '➕ Créer offre' },
              { to: '/entreprise/candidatures', label: '📋 Candidatures' },
              { to: '/entreprise/profil', label: '🏢 Mon profil' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <BadgeMessages />
            <Notifications />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm text-gray-700 font-medium max-w-32 truncate">{user?.email}</span>
                <span className="text-xs text-blue-600 font-medium">Entreprise</span>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all">
              <span>↗</span>
              <span className="hidden sm:block">Déconnexion</span>
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
          <Link to="/entreprise/creer-offre"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
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
            <Link to="/entreprise/creer-offre"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition">
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
                    {offre._count && offre._count.candidatures > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {offre._count.candidatures} candidature{offre._count.candidatures > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 items-center">
                    {offre.statut === 'brouillon' && (
                      <button
                        onClick={() => handleSoumettre(offre.id)}
                        className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-3 py-1.5 rounded-lg transition">
                        Soumettre pour validation
                      </button>
                    )}
                    {offre.statut === 'soumis' && (
                      <span className="text-xs text-yellow-600 font-medium">⏳ En attente de validation</span>
                    )}
                    {offre.statut !== 'publie' && offre.statut !== 'ferme' && (
                      <Link to={`/entreprise/offres/${offre.id}/modifier`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Modifier
                      </Link>
                    )}
                    <Link to={`/entreprise/offres/${offre.id}/candidatures`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium">
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