import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function GestionEntreprises() {
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtre, setFiltre] = useState<'toutes' | 'validees' | 'attente'>('toutes');

  useEffect(() => {
    chargerEntreprises();
  }, []);

  const chargerEntreprises = async () => {
    try {
      const response = await api.get('/admin/entreprises');
      setEntreprises(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValider = async (id: string) => {
    try {
      await api.put(`/admin/entreprises/${id}/valider`);
      await chargerEntreprises();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejeter = async (id: string) => {
    if (!confirm('Voulez-vous vraiment rejeter cette entreprise ?')) return;
    try {
      await api.put(`/admin/entreprises/${id}/rejeter`);
      await chargerEntreprises();
    } catch (err) {
      console.error(err);
    }
  };

  const entreprisesFiltrees = entreprises.filter(e => {
    if (filtre === 'validees') return e.estValide;
    if (filtre === 'attente') return !e.estValide;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Gestion des entreprises</h2>
          <p className="text-gray-500">{entreprises.length} entreprise{entreprises.length > 1 ? 's' : ''}</p>
        </div>

        <div className="flex gap-3 mb-6">
          {(['toutes', 'attente', 'validees'] as const).map((f) => (
            <button key={f} onClick={() => setFiltre(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtre === f ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}>
              {f === 'toutes' ? 'Toutes' : f === 'attente' ? 'En attente' : 'Validées'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : entreprisesFiltrees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucune entreprise trouvée</div>
        ) : (
          <div className="space-y-4">
            {entreprisesFiltrees.map((e) => (
              <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{e.nomEntreprise}</h3>
                      {e.estValide ? (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          ✓ Validée
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{e.utilisateur?.email}</p>
                    <p className="text-gray-400 text-sm">{e.secteurActivite} {e.ville ? `• ${e.ville}` : ''}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Inscrite le {new Date(e.utilisateur?.dateCreation).toLocaleDateString('fr-FR')} •
                      {e.offres?.length} offre{e.offres?.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {!e.estValide ? (
                      <button onClick={() => handleValider(e.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                        ✓ Valider
                      </button>
                    ) : (
                      <button onClick={() => handleRejeter(e.id)}
                        className="border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition">
                        Rejeter
                      </button>
                    )}
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