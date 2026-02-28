import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOffres } from '../../services/offres.service';

import type { Offre, FiltresOffres } from '../../services/offres.service';
export default function ListeOffres() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filtres, setFiltres] = useState<FiltresOffres>({ page: 1 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    chargerOffres();
  }, [filtres]);

  const chargerOffres = async () => {
    setIsLoading(true);
    try {
      const data = await getOffres(filtres);
      setOffres(data.offres);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltres({ ...filtres, search, page: 1 });
  };

  const handleFiltre = (key: string, value: string) => {
    setFiltres({ ...filtres, [key]: value || undefined, page: 1 });
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
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Offres disponibles</h2>
          <p className="text-gray-500">{total} offre{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une offre..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition">
            Rechercher
          </button>
        </form>

        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            onChange={(e) => handleFiltre('typeOffre', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les types</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="freelance">Freelance</option>
          </select>

          <select
            onChange={(e) => handleFiltre('modeTravail', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les modes</option>
            <option value="presentiel">Présentiel</option>
            <option value="teletravail">Télétravail</option>
            <option value="hybride">Hybride</option>
          </select>

          <select
            onChange={(e) => handleFiltre('niveauRequis', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les niveaux</option>
            <option value="licence">Licence</option>
            <option value="master">Master</option>
            <option value="doctorat">Doctorat</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : offres.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucune offre disponible</div>
        ) : (
          <div className="grid gap-4">
            {offres.map((offre) => (
              <Link
                key={offre.id}
                to={`/offres/${offre.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{offre.titre}</h3>
                    <p className="text-gray-500 text-sm">{offre.entreprise.nomEntreprise} • {offre.localisation}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getBadgeColor(offre.typeOffre)}`}>
                    {offre.typeOffre}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{offre.description}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>📍 {offre.modeTravail}</span>
                  <span>🎓 {offre.niveauRequis}</span>
                  {offre.dureeMois && <span>⏱ {offre.dureeMois} mois</span>}
                  <span>📅 Limite : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}