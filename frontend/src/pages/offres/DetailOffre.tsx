import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOffreById } from '../../services/offres.service';
import type { Offre } from '../../services/offres.service';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DetailOffre() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [offre, setOffre] = useState<Offre | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lettreMotivation, setLettreMotivation] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [isPostuling, setIsPostuling] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fichiers
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [lettreFile, setLettreFile] = useState<File | null>(null);
  const [diplomeFile, setDiplomeFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingLettre, setUploadingLettre] = useState(false);
  const [uploadingDiplome, setUploadingDiplome] = useState(false);
  const [diplomeUrl, setDiplomeUrl] = useState('');
  const [lettreUrl, setLettreUrl] = useState('');

  useEffect(() => {
    if (id) chargerOffre();
  }, [id]);

  const chargerOffre = async () => {
    try {
      const data = await getOffreById(id!);
      setOffre(data);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFichier = async (file: File, type: string): Promise<string> => {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('type', type);
    const response = await api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  };

  const handleUploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    setUploadingCv(true);
    try {
      const url = await uploadFichier(file, 'cv');
      setCvUrl(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du CV');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleUploadLettre = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLettreFile(file);
    setUploadingLettre(true);
    try {
      const url = await uploadFichier(file, 'lettre');
      setLettreUrl(url);
    } catch (err) {
      setError('Erreur lors du téléchargement de la lettre');
    } finally {
      setUploadingLettre(false);
    }
  };

  const handleUploadDiplome = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDiplomeFile(file);
    setUploadingDiplome(true);
    try {
      const url = await uploadFichier(file, 'diplome');
      setDiplomeUrl(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du diplôme');
    } finally {
      setUploadingDiplome(false);
    }
  };

  const handlePostuler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPostuling(true);
    try {
      await api.post('/candidatures', {
        offreId: id,
        lettreMotivation,
        cvUrl,
        documentsComplementaires: JSON.stringify({
          lettre: lettreUrl,
          diplome: diplomeUrl,
        }),
      });
      setSuccess('🎉 Candidature envoyée avec succès !');
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setIsPostuling(false);
    }
  };

  const typeColors: Record<string, string> = {
    stage: 'bg-blue-100 text-blue-700',
    alternance: 'bg-purple-100 text-purple-700',
    cdi: 'bg-green-100 text-green-700',
    cdd: 'bg-yellow-100 text-yellow-700',
    freelance: 'bg-orange-100 text-orange-700',
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!offre) return <div className="min-h-screen flex items-center justify-center">Offre introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to="/offres" className="text-sm text-gray-600 hover:text-green-700">← Retour aux offres</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Détail offre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{offre.titre}</h2>
              <p className="text-gray-500">{offre.entreprise.nomEntreprise} • {offre.localisation}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${typeColors[offre.typeOffre] || 'bg-gray-100 text-gray-600'}`}>
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
            <div>
              <p className="text-xs text-gray-500 mb-1">Durée</p>
              <p className="text-sm font-medium text-gray-800">{offre.dureeMois ? `${offre.dureeMois} mois` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date limite</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{offre.description}</p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          ) : user && user.role === 'etudiant' ? (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition">
              {showForm ? 'Annuler' : '📝 Postuler à cette offre'}
            </button>
          ) : !user ? (
            <a href="/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition">
              🔐 Connectez-vous pour postuler
            </a>
          ) : null}
        </div>

        {/* Formulaire candidature */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Votre candidature</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handlePostuler} className="space-y-6">

              {/* CV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 transition ${cvFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
                  {cvFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-gray-700 font-medium">{cvFile.name}</span>
                        <span className="text-xs text-gray-400">({(cvFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      {uploadingCv && <span className="text-xs text-green-600">Téléchargement...</span>}
                      {cvUrl && <span className="text-xs text-green-600 font-medium">✓ Uploadé</span>}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <span className="text-3xl mb-2">📄</span>
                      <span className="text-sm text-gray-600 font-medium">Cliquez pour charger votre CV</span>
                      <span className="text-xs text-gray-400 mt-1">PDF, Word — max 5MB</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCv} className="hidden" />
                    </label>
                  )}
                  {!cvFile && <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCv} className="hidden" />}
                </div>
                {!cvFile && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Ou entrez un lien URL :</p>
                    <input type="url" value={cvUrl} onChange={(e) => setCvUrl(e.target.value)}
                      placeholder="https://monsite.com/cv.pdf"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                )}
              </div>

              {/* Lettre de motivation fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lettre de motivation (fichier optionnel)
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 transition ${lettreFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
                  {lettreFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-gray-700 font-medium">{lettreFile.name}</span>
                        <span className="text-xs text-gray-400">({(lettreFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      {uploadingLettre && <span className="text-xs text-green-600">Téléchargement...</span>}
                      {lettreUrl && <span className="text-xs text-green-600 font-medium">✓ Uploadé</span>}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <span className="text-3xl mb-2">✉️</span>
                      <span className="text-sm text-gray-600 font-medium">Cliquez pour charger votre lettre</span>
                      <span className="text-xs text-gray-400 mt-1">PDF, Word — max 5MB</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadLettre} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Diplôme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diplôme / Relevé de notes (optionnel)
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 transition ${diplomeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
                  {diplomeFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-gray-700 font-medium">{diplomeFile.name}</span>
                        <span className="text-xs text-gray-400">({(diplomeFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      {uploadingDiplome && <span className="text-xs text-green-600">Téléchargement...</span>}
                      {diplomeUrl && <span className="text-xs text-green-600 font-medium">✓ Uploadé</span>}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <span className="text-3xl mb-2">🎓</span>
                      <span className="text-sm text-gray-600 font-medium">Cliquez pour charger votre diplôme</span>
                      <span className="text-xs text-gray-400 mt-1">PDF, Image — max 5MB</span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadDiplome} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Lettre de motivation texte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lettre de motivation (texte) <span className="text-red-500">*</span>
                </label>
                <textarea value={lettreMotivation} onChange={(e) => setLettreMotivation(e.target.value)}
                  rows={6} required
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              </div>

              <button type="submit" disabled={isPostuling || !cvUrl || !lettreMotivation}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition">
                {isPostuling ? 'Envoi en cours...' : '🚀 Envoyer ma candidature'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}