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
    secteur: '',
    localisation: '',
  });
  const [showFiltres, setShowFiltres] = useState(false);
  const [alerteSauvegardee, setAlerteSauvegardee] = useState(false);
  const [alerteMessage, setAlerteMessage] = useState('');

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
      if (filtres.secteur) params.append('secteur', filtres.secteur);
      if (filtres.localisation) params.append('localisation', filtres.localisation);
      if (search) params.append('search', search);
      const response = await api.get(`/offres?${params.toString()}`);
      setOffres(response.data.data.offres);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    chargerOffres();
  };

  const sauvegarderAlerte = async () => {
    const criteres = Object.entries(filtres).filter(([,v]) => v !== '').map(([k,v]) => k + '=' + v).join('&');
    if (!criteres && !recherche) {
      setAlerteMessage('⚠️ Définissez au moins un critère avant de sauvegarder une alerte.');
      setTimeout(() => setAlerteMessage(''), 3000);
      return;
    }
    try {
      const token = sessionStorage.getItem('accessToken');
      await fetch('http://localhost:3001/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          titre: '🔔 Alerte offres sauvegardée',
          message: 'Vous serez notifié des nouvelles offres correspondant à vos critères : ' + (recherche ? 'mot-clé=' + recherche + ' ' : '') + criteres,
          typeNotification: 'offre',
          lienAction: '/offres?' + (recherche ? 'q=' + recherche + '&' : '') + criteres
        })
      });
      setAlerteSauvegardee(true);
      setAlerteMessage('✅ Alerte sauvegardée ! Vous serez notifié des nouvelles offres correspondantes.');
      setTimeout(() => { setAlerteMessage(''); setAlerteSauvegardee(false); }, 4000);
    } catch {
      setAlerteMessage("❌ Erreur lors de la sauvegarde de l'alerte.");
      setTimeout(() => setAlerteMessage(''), 3000);
    }
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
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/offres', label: 'Offres', icon: 'fa-solid fa-briefcase' },
              { to: '/candidatures', label: 'Candidatures', icon: 'fa-solid fa-file-lines' },
              { to: '/competences', label: 'Compétences', icon: 'fa-solid fa-star' },
              { to: '/profil', label: 'Profil', icon: 'fa-solid fa-user' },
              { to: '/messagerie', label: 'Messages', icon: 'fa-solid fa-comments' },
              { to: '/statut-professionnel', label: 'Mon statut', icon: 'fa-solid fa-chart-bar' },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-150">{icon && <i className={icon}></i>} {label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Notifications />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all">
              <span><i className="fa-solid fa-arrow-up-right-from-square"></i></span>
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
            <i className="fa-solid fa-magnifying-glass"></i> Filtres {nbFiltresActifs > 0 && `(${nbFiltresActifs})`}
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
          <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Secteur</label>
              <select value={filtres.secteur} onChange={(e) => handleFiltreChange('secteur', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Tous secteurs</option>
                <option value="Informatique">Informatique</option>
                <option value="Data">Data / IA</option>
                <option value="Design">Design / UX</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="RH">Ressources humaines</option>
                <option value="maintenance">Maintenance</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Localisation</label>
              <select value={filtres.localisation} onChange={(e) => handleFiltreChange('localisation', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Toutes villes</option>
                <option value="Dakar">Dakar</option>
                <option value="Thiès">Thiès</option>
                <option value="Saint-Louis">Saint-Louis</option>
                <option value="Touba">Touba</option>
                <option value="Kaolack">Kaolack</option>
                <option value="Ziguinchor">Ziguinchor</option>
                <option value="Bambey">Bambey</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={resetFiltres}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <i className="fa-solid fa-rotate-right"></i> Réinitialiser
            </button>
            <button onClick={sauvegarderAlerte}
              className="flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition font-medium">
              <i className="fa-solid fa-bell"></i> Créer une alerte
            </button>
          </div>
          {alerteMessage && (
            <div className={`mt-3 px-4 py-3 rounded-lg text-sm font-medium ${alerteMessage.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : alerteMessage.startsWith('⚠️') ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {alerteMessage}
            </div>
          )}
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
                    <span><i className="fa-solid fa-briefcase"></i> {offre.modeTravail}</span>
                    <span><i className="fa-solid fa-graduation-cap"></i> {offre.niveauRequis}</span>
                    {offre.salaireMin && (
                      <span><i className="fa-solid fa-money-bill-wave"></i> {offre.salaireMin.toLocaleString()} {offre.salaireMax ? `— ${offre.salaireMax.toLocaleString()}` : ''} FCFA</span>
                    )}
                    {offre.dureeMois && <span>⏱ {offre.dureeMois} mois</span>}
                    <span><i className="fa-solid fa-calendar"></i> Limite : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}</span>
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