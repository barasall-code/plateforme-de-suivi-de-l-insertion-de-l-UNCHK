import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOffreById, postuler } from '../../services/offres.service';
import type { Offre } from '../../services/offres.service';
import { useAuth } from '../../context/AuthContext';

export default function DetailOffre() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offre, setOffre] = useState<Offre | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lettreMotivation, setLettreMotivation] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [isPostuling, setIsPostuling] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) chargerOffre();
  }, [id]);

  const chargerOffre = async () => {
    try {
      const data = await getOffreById(id!);
      setOffre(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostuler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPostuling(true);
    try {
      await postuler(id!, { lettreMotivation, cvUrl });
      setSuccess('Candidature envoyée avec succès !');
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setIsPostuling(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!offre) return <div className="min-h-screen flex items-center justify-center">Offre introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK</h1>
          <Link to="/offres" className="text-sm text-gray-600 hover:text-green-700">
            ← Retour aux offres
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{offre.titre}</h2>
              <p className="text-gray-500">{offre.entreprise.nomEntreprise} • {offre.localisation}</p>
            </div>
            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
              {offre.typeOffre}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Mode de travail</p>
              <p className="text-sm font-medium text-gray-800">{offre.modeTravail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Niveau requis</p>
              <p className="text-sm font-medium text-gray-800">{offre.niveauRequis}</p>
            </div>
            {offre.dureeMois && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Durée</p>
                <p className="text-sm font-medium text-gray-800">{offre.dureeMois} mois</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Date limite</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Description du poste</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{offre.description}</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {user?.role === 'etudiant' && !success && (
            <div>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition"
                >
                  Postuler à cette offre
                </button>
              ) : (
                <form onSubmit={handlePostuler} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Votre candidature</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lettre de motivation
                    </label>
                    <textarea
                      value={lettreMotivation}
                      onChange={(e) => setLettreMotivation(e.target.value)}
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lien vers votre CV
                    </label>
                    <input
                      type="url"
                      value={cvUrl}
                      onChange={(e) => setCvUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isPostuling}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      {isPostuling ? 'Envoi...' : 'Envoyer ma candidature'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}