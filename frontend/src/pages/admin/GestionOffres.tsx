import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface OffreEnAttente {
  id: string;
  titre: string;
  typeOffre: string;
  localisation: string;
  domaine: string;
  dateCreation: string;
  dateLimiteCandidature: string;
  description: string;
  entreprise: { nomEntreprise: string };
}

interface OffrePubliee {
  id: string;
  titre: string;
  typeOffre: string;
  localisation: string;
  datePublication?: string;
  dateLimiteCandidature: string;
  entreprise: { nomEntreprise: string };
}

const typeColors: Record<string, string> = {
  stage: 'bg-blue-100 text-blue-700',
  alternance: 'bg-purple-100 text-purple-700',
  cdi: 'bg-green-100 text-green-700',
  cdd: 'bg-yellow-100 text-yellow-700',
  freelance: 'bg-orange-100 text-orange-700',
};

export default function GestionOffres() {
  const { user, logout } = useAuth();
  const [offresEnAttente, setOffresEnAttente] = useState<OffreEnAttente[]>([]);
  const [offresPubliees, setOffresPubliees] = useState<OffrePubliee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'attente' | 'publiees'>('attente');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    chargerOffres();
  }, []);

  const chargerOffres = async () => {
    setIsLoading(true);
    try {
      const [attenteRes, publieeRes] = await Promise.all([
        api.get('/admin/offres-en-attente'),
        api.get('/offres?page=1'),
      ]);
      setOffresEnAttente(attenteRes.data.data);
      setOffresPubliees(publieeRes.data.data.offres || []);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleValider = async (id: string) => {
    if (!confirm('Valider et publier cette offre ? Elle sera visible par tous les étudiants.')) return;
    try {
      await api.put(`/admin/offres/${id}/valider`);
      await chargerOffres();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la validation';
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-green-700 font-medium">Dashboard</Link>
            <Link to="/admin/entreprises" className="text-sm text-gray-600 hover:text-green-700 font-medium">Entreprises</Link>
            <Link to="/admin/utilisateurs" className="text-sm text-gray-600 hover:text-green-700 font-medium">Utilisateurs</Link>
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">admin</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">Déconnexion</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestion des offres</h2>
            <p className="text-gray-500 text-sm mt-1">
              <span className={`font-medium ${offresEnAttente.length > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                {offresEnAttente.length} à valider
              </span>
              {' '}• {offresPubliees.length} publiée{offresPubliees.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('attente')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition ${
              tab === 'attente'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            ⏳ À valider
            {offresEnAttente.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                tab === 'attente' ? 'bg-white text-yellow-600' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {offresEnAttente.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('publiees')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition ${
              tab === 'publiees'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            ✅ Publiées ({offresPubliees.length})
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : tab === 'attente' ? (
          offresEnAttente.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-gray-500 font-medium">Aucune offre en attente de validation.</p>
              <p className="text-gray-400 text-sm mt-1">Toutes les offres soumises ont été traitées.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offresEnAttente.map((offre) => (
                <div key={offre.id} className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">{offre.titre}</h3>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          En attente
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        🏢 {offre.entreprise.nomEntreprise} • 📍 {offre.localisation} • 📁 {offre.domaine}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-4 ${typeColors[offre.typeOffre] || 'bg-gray-100 text-gray-600'}`}>
                      {offre.typeOffre}
                    </span>
                  </div>

                  {/* Description expandable */}
                  <div className="mb-4">
                    <p className={`text-sm text-gray-600 ${expanded === offre.id ? '' : 'line-clamp-2'}`}>
                      {offre.description}
                    </p>
                    {offre.description?.length > 120 && (
                      <button
                        onClick={() => setExpanded(expanded === offre.id ? null : offre.id)}
                        className="text-xs text-green-600 hover:text-green-700 mt-1 font-medium">
                        {expanded === offre.id ? 'Réduire ▲' : 'Lire plus ▼'}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Créée le {new Date(offre.dateCreation).toLocaleDateString('fr-FR')}
                      {' '}• Limite candidature : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}
                    </p>
                    <button
                      onClick={() => handleValider(offre.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
                      ✓ Valider et publier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          offresPubliees.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500">Aucune offre publiée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offresPubliees.map((offre) => (
                <div key={offre.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">{offre.titre}</h3>
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Publiée
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        🏢 {offre.entreprise.nomEntreprise} • 📍 {offre.localisation}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-4 ${typeColors[offre.typeOffre] || 'bg-gray-100 text-gray-600'}`}>
                      {offre.typeOffre}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Limite candidature : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
