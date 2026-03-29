import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getFileUrl } from '../../services/api';

interface Competence {
  competenceId: string;
  niveauMaitrise: string;
  competence: { nomCompetence: string };
}
interface Etudiant {
  nom: string;
  prenom: string;
  photoUrl?: string;
  cvUrl?: string;
  linkedinUrl?: string;
  numeroEtudiant: string;
  filiere?: string;
  niveauEtude?: string;
  promotion?: string;
  telephone?: string;
  utilisateur?: { email: string };
  competences?: Competence[];
}
interface ProfilData {
  etudiant: Etudiant;
  candidature: { lettreMotivation: string; dateCandidature: string };
}

export default function ProfilCandidat() {
  const { candidatureId } = useParams<{ candidatureId: string }>();
  const navigate = useNavigate();
  const [contactLoading, setContactLoading] = useState(false);

  const handleContacter = async () => {
    if (!data) return;
    setContactLoading(true);
    try {
      const etudiantId = data.etudiant?.id;
      // L'entreprise connectée est l'utilisateur courant — récupérer son profil
      const profilRes = await api.get('/profil');
      const entrepriseId = profilRes.data?.data?.id;
      if (!etudiantId || !entrepriseId) {
        console.error('IDs manquants:', { etudiantId, entrepriseId });
        return;
      }
      const res = await api.post('/messagerie/conversations', { etudiantId, entrepriseId });
      if (res.data?.success) {
        navigate('/messagerie', { state: { conversationId: res.data.data?.id } });
      }
    } catch (err) {
      console.error('Erreur création conversation:', err);
    } finally {
      setContactLoading(false);
    }
  };
  const [data, setData] = useState<ProfilData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    chargerProfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatureId]);

  const chargerProfil = async () => {
    try {
      const response = await api.get(`/candidatures/${candidatureId}/profil`);
      setData(response.data.data);
    } catch {
      setError('Profil introuvable');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!data) return null;

  const { etudiant, candidature } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <button onClick={() => window.history.back()} className="text-sm text-gray-600 hover:text-green-700">
            <><i className="fa-solid fa-arrow-left mr-1"></i> Retour</> aux candidatures
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Profil du candidat</h2>

        {/* Identité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {etudiant.photoUrl ? (
              <img src={getFileUrl(etudiant.photoUrl)} alt="Photo" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{etudiant.prenom} {etudiant.nom}</h3>
              <p className="text-gray-500">{etudiant.utilisateur?.email}</p>
              <p className="text-sm text-gray-400">N° {etudiant.numeroEtudiant}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Filière</p>
              <p className="text-sm font-medium text-gray-800">{etudiant.filiere || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Niveau d'étude</p>
              <p className="text-sm font-medium text-gray-800">{etudiant.niveauEtude || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Promotion</p>
              <p className="text-sm font-medium text-gray-800">{etudiant.promotion || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Téléphone</p>
              <p className="text-sm font-medium text-gray-800">{etudiant.telephone || '—'}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            {etudiant.cvUrl && (
              <a href={getFileUrl(etudiant.cvUrl)} target="_blank" rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                <><i className="fa-solid fa-file-pdf mr-1"></i> Voir CV</>
              </a>
            )}
            {etudiant.linkedinUrl && (
              <a href={etudiant.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                �� LinkedIn
              </a>
            )}
            <button
              onClick={handleContacter}
              disabled={contactLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {contactLoading ? '<i className="fa-solid fa-hourglass-half text-gray-400"></i> Connexion...' : '<><i className="fa-solid fa-comment-dots mr-1"></i> Contacter</>'}
            </button>
          </div>
        </div>

        {/* Compétences */}
        {etudiant.competences && etudiant.competences.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {(etudiant.competences ?? []).map((c) => (
                <span key={c.competenceId}
                  className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  {c.competence.nomCompetence} — {c.niveauMaitrise}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Candidature */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Candidature</h3>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Lettre de motivation</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {candidature.lettreMotivation}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Postulé le {new Date(candidature.dateCandidature).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </main>
    </div>
  );
}
