import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Notifications from '../../components/Notifications';
import api from '../../services/api';

interface Offre {
  id: string;
  titre: string;
  typeOffre: string;
  domaine: string;
  localisation: string;
  modeTravail: string;
  niveauRequis: string;
  salaireMin?: number;
  salaireMax?: number;
  dureeMois?: number;
  dateLimiteCandidature: string;
  entreprise: { nomEntreprise: string };
}

export default function ListeOffres() {
  const { user, logout } = useAuth();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtres, setFiltres] = useState({
    typeOffre: '',
    modeTravail: '',
    niveauRequis: '',
  });
  const [showFiltres, setShowFiltres] = useState(false);

  useEffect(() => {
    chargerOffres();
  }, [page, filtres]);

  const chargerOffres = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      if (filtres.typeOffre) params.append('typeOffre', filtres.typeOffre);
      if (filtres.modeTravail) params.append('modeTravail', filtres.modeTravail);
      if (filtres.niveauRequis) params.append('niveauRequis', filtres.niveauRequis);
      if (search) params.append('search', search);
      const response = await api.get(`/offres?${params.toString()}`);
      setOffres(response.data.data.offres);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    chargerOffres();
  };

  const handleFiltreChange = (key: string, value: string) => {
    setFiltres({ ...filtres, [key]: value });
    setPage(1);
  };

  const resetFiltres = () => {
    setFiltres({ typeOffre: '', modeTravail: '', niveauRequis: '' });
    setSearch('');
    setPage(1);
  };

  const nbFiltresActifs = Object.values(filtres).filter(v => v !== '').length;

  const typeColors: Record<string, string> = {
    stage: 'bg-blue-100 text-blue-700',
    alternance: 'bg-purple-100 text-purple-700',
    cdi: 'bg-green-100 text-green-700',
    cdd: 'bg-yellow-100 text-yellow-700',
    freelance: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-green-700">UNCHK</Link>
          <div className="flex items-center gap-4">
            <Link to="/candidatures" className="text-sm text-gray-600 hover:text-green-700">Mes candidatures</Link>
            <Link to="/profil" className="text-sm text-gray-600 hover:text-green-700">Mon profil</Link>
            <Notifications />
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Offres disponibles</h2>
            <p className="text-gray-500 text-sm mt-1">
              {total} offre{total > 1 ? 's' : ''} • Page {page} sur {totalPages}
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-3 mb-4">
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher par titre, entreprise..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition font-medium text-sm">
            Rechercher
          </button>
          <button onClick={() => setShowFiltres(!showFiltres)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition font-medium text-sm ${
              showFiltres || nbFiltresActifs > 0
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}>
            🔍 Filtres {nbFiltresActifs > 0 && `(${nbFiltresActifs})`}
          </button>
          {(nbFiltresActifs > 0 || search) && (
            <button onClick={resetFiltres}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm transition">
              ✕
            </button>
          )}
        </div>

        {/* Filtres */}
        {showFiltres && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type d'offre</label>
              <select value={filtres.typeOffre} onChange={(e) => handleFiltreChange('typeOffre', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Tous</option>
                <option value="stage">Stage</option>
                <option value="alternance">Alternance</option>
                <option value="cdi">CDI</option>
                <option value="cdd">CDD</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mode de travail</label>
              <select value={filtres.modeTravail} onChange={(e) => handleFiltreChange('modeTravail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Tous</option>
                <option value="presentiel">Présentiel</option>
                <option value="teletravail">Télétravail</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Niveau requis</label>
              <select value={filtres.niveauRequis} onChange={(e) => handleFiltreChange('niveauRequis', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Tous</option>
                <option value="licence">Licence</option>
                <option value="master">Master</option>
                <option value="doctorat">Doctorat</option>
              </select>
            </div>
          </div>
        )}

        {/* Liste offres */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : offres.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-3">Aucune offre ne correspond à vos critères.</p>
            <button onClick={resetFiltres} className="text-green-600 hover:text-green-700 font-medium text-sm">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {offres.map((offre) => (
                <Link key={offre.id} to={`/offres/${offre.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{offre.titre}</h3>
                      <p className="text-gray-500 text-sm">{offre.entreprise.nomEntreprise} • {offre.localisation}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[offre.typeOffre] || 'bg-gray-100 text-gray-600'}`}>
                      {offre.typeOffre}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>📁 {offre.domaine}</span>
                    <span>💼 {offre.modeTravail}</span>
                    <span>🎓 {offre.niveauRequis}</span>
                    {offre.salaireMin && (
                      <span>💰 {offre.salaireMin.toLocaleString()} {offre.salaireMax ? `— ${offre.salaireMax.toLocaleString()}` : ''} FCFA</span>
                    )}
                    {offre.dureeMois && <span>⏱ {offre.dureeMois} mois</span>}
                    <span>📅 Limite : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
                  ← Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      p === page
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}