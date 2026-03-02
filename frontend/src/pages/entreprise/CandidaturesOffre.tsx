import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

interface Candidature {
  id: string;
  statut: string;
  dateCandidature: string;
  lettreMotivation: string;
  cvUrl: string;
  commentaireEntreprise?: string;
  etudiant: {
    nom: string;
    prenom: string;
    filiere: string;
    niveauEtude: string;
    cvUrl?: string;
  };
}

const statutColors: Record<string, string> = {
  soumise: 'bg-blue-100 text-blue-700',
  vue: 'bg-yellow-100 text-yellow-700',
  entretien: 'bg-purple-100 text-purple-700',
  acceptee: 'bg-green-100 text-green-700',
  refusee: 'bg-red-100 text-red-700',
};

export default function CandidaturesOffre() {
  const { offreId } = useParams<{ offreId: string }>();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Candidature | null>(null);
  const [newStatut, setNewStatut] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    chargerCandidatures();
  }, [offreId]);

  const chargerCandidatures = async () => {
    try {
      const response = await api.get(`/candidatures/offre/${offreId}`);
      setCandidatures(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangerStatut = async () => {
    if (!selected || !newStatut) return;
    setIsUpdating(true);
    try {
      await api.put(`/candidatures/${selected.id}/statut`, {
        statut: newStatut,
        commentaire,
      });
      await chargerCandidatures();
      setSelected(null);
      setNewStatut('');
      setCommentaire('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK — Entreprise</h1>
          <Link to="/entreprise/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Candidatures reçues</h2>
          <p className="text-gray-500">{candidatures.length} candidature{candidatures.length > 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : candidatures.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucune candidature reçue pour cette offre.</div>
        ) : (
          <div className="space-y-4">
            {candidatures.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {c.etudiant.prenom} {c.etudiant.nom}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {c.etudiant.filiere} • {c.etudiant.niveauEtude}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statutColors[c.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {c.statut}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Lettre de motivation</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{c.lettreMotivation}</p>
                </div>

                {c.commentaireEntreprise && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Votre commentaire</p>
                    <p className="text-sm text-gray-700">{c.commentaireEntreprise}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Reçue le {new Date(c.dateCandidature).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex gap-3">
                    {c.cvUrl && (
                      <a href={c.cvUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Voir CV
                      </a>
                    )}
                    <Link
                      to={`/entreprise/candidatures/${c.id}/profil`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Voir profil
                    </Link>
                    <button
                      onClick={() => { setSelected(c); setNewStatut(c.statut); }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Changer statut
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                Changer le statut — {selected.etudiant.prenom} {selected.etudiant.nom}
              </h3>
              <select value={newStatut} onChange={(e) => setNewStatut(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="soumise">Soumise</option>
                <option value="vue">Vue</option>
                <option value="entretien">Entretien</option>
                <option value="acceptee">Acceptée</option>
                <option value="refusee">Refusée</option>
              </select>
              <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
                rows={3} placeholder="Commentaire (optionnel)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
              <div className="flex gap-3">
                <button onClick={handleChangerStatut} disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
                  {isUpdating ? 'Mise à jour...' : 'Confirmer'}
                </button>
                <button onClick={() => setSelected(null)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}