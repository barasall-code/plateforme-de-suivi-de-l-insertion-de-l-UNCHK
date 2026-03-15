import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Offre {
  id: string;
  titre: string;
  statut: string;
  typeOffre: string;
  localisation: string;
  dateCreation: string;
  entreprise: { nomEntreprise: string };
}

export default function GestionOffres() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const r = await api.get('/admin/offres-en-attente');
      setOffres(r.data.data);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const valider = async (id: string) => {
    try {
      await api.put('/admin/offres/' + id + '/valider');
      setMessage('Offre publiée avec succès !');
      charger();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Validation des offres</h1>
            <p className="text-gray-500 text-sm mt-1">{offres.length} offre(s) en attente</p>
          </div>
          <button onClick={() => navigate('/admin')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm">
            ← Dashboard
          </button>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : offres.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500">Aucune offre en attente de validation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offres.map(offre => (
              <div key={offre.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{offre.titre}</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {offre.statut}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {offre.typeOffre}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{offre.entreprise.nomEntreprise}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {offre.localisation} • Créée le {new Date(offre.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button onClick={() => valider(offre.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition ml-4">
                    ✅ Publier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}