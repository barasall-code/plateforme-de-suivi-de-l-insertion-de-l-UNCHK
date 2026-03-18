import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getFileUrl } from '../../services/api';

const SITUATION_LABELS: Record<string, string> = {
  en_cours_etude:    "En cours d'étude",
  sous_contrat_stage: 'Sous contrat stage',
  sous_contrat_cdd:  'Sous contrat CDD',
  sous_contrat_cdi:  'Sous contrat CDI',
  chomeur:           'Chômeur',
};

const SITUATION_COLORS: Record<string, string> = {
  en_cours_etude:    'bg-blue-100 text-blue-700',
  sous_contrat_stage: 'bg-purple-100 text-purple-700',
  sous_contrat_cdd:  'bg-yellow-100 text-yellow-700',
  sous_contrat_cdi:  'bg-green-100 text-green-700',
  chomeur:           'bg-red-100 text-red-700',
};

export default function DetailEtudiant() {
  const { etudiantId } = useParams<{ etudiantId: string }>();
  const [etudiant, setEtudiant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentaire, setCommentaire] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    chargerEtudiant();
  }, [etudiantId]);

  const chargerEtudiant = async () => {
    try {
      const response = await api.get(`/superviseur/etudiants/${etudiantId}`);
      setEtudiant(response.data.data);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentaire = async () => {
    if (!commentaire.trim()) return;
    setIsSaving(true);
    try {
      await api.put(`/superviseur/etudiants/${etudiantId}/commentaire`, { commentaire });
      setSuccess('Commentaire sauvegardé !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsSaving(false);
    }
  };

  const statutColors: Record<string, string> = {
    soumise: 'bg-blue-100 text-blue-700',
    vue: 'bg-yellow-100 text-yellow-700',
    entretien: 'bg-purple-100 text-purple-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee: 'bg-red-100 text-red-700',
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!etudiant) return <div className="min-h-screen flex items-center justify-center text-red-500">Étudiant introuvable</div>;

  const acceptees = etudiant.candidatures?.filter((c: any) => c.statut === 'acceptee').length || 0;
  const enCours = etudiant.candidatures?.filter((c: any) => ['soumise', 'vue', 'entretien'].includes(c.statut)).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to="/superviseur/etudiants" className="text-sm text-gray-600 hover:text-green-700">
            ← Mes étudiants
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête étudiant */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
              {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{etudiant.prenom} {etudiant.nom}</h2>
              <p className="text-gray-500">{etudiant.utilisateur?.email}</p>
              <p className="text-gray-400 text-sm">N° {etudiant.numeroEtudiant}</p>
              {etudiant.situationActuelle && (
                <span className={`inline-block mt-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${SITUATION_COLORS[etudiant.situationActuelle] ?? 'bg-gray-100 text-gray-600'}`}>
                  {SITUATION_LABELS[etudiant.situationActuelle] ?? etudiant.situationActuelle}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Filière</p>
              <p className="text-sm font-medium text-gray-800">{etudiant.filiere || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Niveau</p>
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

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📁 Documents fournis</p>
            <div className="grid grid-cols-1 gap-3">
              <div className={"flex items-center justify-between p-3 rounded-xl border " + (etudiant.cvUrl ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50")}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Curriculum Vitae (CV)</p>
                    <p className="text-xs text-gray-500">{etudiant.cvUrl ? "Document disponible" : "Non fourni"}</p>
                  </div>
                </div>
                {etudiant.cvUrl ? (
                  <a href={getFileUrl(etudiant.cvUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition">
                    👁️ Consulter
                  </a>
                ) : <span className="text-xs text-gray-400 italic">Non soumis</span>}
              </div>
              <div className={"flex items-center justify-between p-3 rounded-xl border " + (etudiant.linkedinUrl ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50")}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Profil LinkedIn</p>
                    <p className="text-xs text-gray-500">{etudiant.linkedinUrl ? etudiant.linkedinUrl.substring(0, 40) : "Non renseigné"}</p>
                  </div>
                </div>
                {etudiant.linkedinUrl ? (
                  <a href={etudiant.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition">
                    👁️ Consulter
                  </a>
                ) : <span className="text-xs text-gray-400 italic">Non renseigné</span>}
              </div>
              <div className={"flex items-center justify-between p-3 rounded-xl border " + (etudiant.photoUrl ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-gray-50")}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">��️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Photo de profil</p>
                    <p className="text-xs text-gray-500">{etudiant.photoUrl ? "Photo disponible" : "Non fournie"}</p>
                  </div>
                </div>
                {etudiant.photoUrl ? (
                  <a href={getFileUrl(etudiant.photoUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition">
                    👁️ Consulter
                  </a>
                ) : <span className="text-xs text-gray-400 italic">Non fournie</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats candidatures */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-gray-800">{etudiant.candidatures?.length || 0}</p>
            <p className="text-gray-500 text-sm mt-1">Total candidatures</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-yellow-500">{enCours}</p>
            <p className="text-gray-500 text-sm mt-1">En cours</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-green-600">{acceptees}</p>
            <p className="text-gray-500 text-sm mt-1">Acceptées</p>
          </div>
        </div>

        {/* Competences */}
        {etudiant.competences?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {etudiant.competences.map((c: any) => (
                <span key={c.competenceId} className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  {c.competence.nom} — {c.niveauMaitrise}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Historique candidatures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Historique des candidatures</h3>
          {etudiant.candidatures?.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune candidature</p>
          ) : (
            <div className="space-y-3">
              {etudiant.candidatures?.map((c: any) => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.offre.titre}</p>
                    <p className="text-xs text-gray-500">{c.offre.entreprise.nomEntreprise} • {c.offre.entreprise.secteurActivite}</p>
                    <p className="text-xs text-gray-400">{new Date(c.dateCandidature).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statutColors[c.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {c.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commentaire superviseur */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Commentaire de suivi</h3>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
          <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
            rows={4} placeholder="Ajoutez un commentaire de suivi pour cet étudiant..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4" />
          <button onClick={handleCommentaire} disabled={isSaving || !commentaire.trim()}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50">
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder le commentaire'}
          </button>
        </div>
      </main>
    </div>
  );
}