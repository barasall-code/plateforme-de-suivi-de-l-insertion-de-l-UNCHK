import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getFileUrl } from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

interface Candidature {
  id: string;
  statut: string;
  dateCandidature: string;
  lettreMotivation: string;
  cvUrl: string;
  documentsComplementaires?: { lettre?: string; diplome?: string } | null;
  commentaireEntreprise?: string;
  etudiant: {
    nom: string;
    prenom: string;
    filiere: string;
    niveauEtude: string;
    cvUrl?: string;
  };
}

type ActionType = 'acceptee' | 'refusee' | 'gerer';

const STATUTS: Record<string, { label: string; color: string }> = {
  soumise:   { label: 'Soumise',    color: 'bg-blue-100 text-blue-700' },
  vue:       { label: 'Vue',        color: 'bg-yellow-100 text-yellow-700' },
  entretien: { label: 'Entretien',  color: 'bg-purple-100 text-purple-700' },
  acceptee:  { label: 'Acceptée',   color: 'bg-green-100 text-green-700' },
  refusee:   { label: 'Refusée',    color: 'bg-red-100 text-red-700' },
};

export default function CandidaturesOffre() {
  const { offreId } = useParams<{ offreId: string }>();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [modal, setModal] = useState<{ candidature: Candidature; action: ActionType } | null>(null);
  const [customStatut, setCustomStatut] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    chargerCandidatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offreId]);

  const chargerCandidatures = async () => {
    try {
      const response = await api.get(`/candidatures/offre/${offreId}`);
      setCandidatures(response.data.data);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const ouvrirModal = (c: Candidature, action: ActionType) => {
    setModal({ candidature: c, action });
    setCustomStatut(c.statut);
    setCommentaire('');
    setErreur('');
  };

  const handleConfirmer = async () => {
    if (!modal) return;
    const statut = modal.action === 'gerer' ? customStatut : modal.action;
    if (!statut) return;
    setIsUpdating(true);
    setErreur('');
    try {
      await api.put(`/candidatures/${modal.candidature.id}/statut`, {
        statut,
        commentaire: commentaire || undefined,
      });
      const label = STATUTS[statut]?.label ?? statut;
      setSuccess(`Candidature de ${modal.candidature.etudiant.prenom} ${modal.candidature.etudiant.nom} — "${label}" enregistré.`);
      setModal(null);
      await chargerCandidatures();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setErreur((err as ApiError).response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = {
    total:     candidatures.length,
    nouvelles: candidatures.filter(c => c.statut === 'soumise').length,
    entretien: candidatures.filter(c => c.statut === 'entretien').length,
    acceptees: candidatures.filter(c => c.statut === 'acceptee').length,
    refusees:  candidatures.filter(c => c.statut === 'refusee').length,
  };

  const liste = filtreStatut
    ? candidatures.filter(c => c.statut === filtreStatut)
    : candidatures;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all">
            ← Retour
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Candidatures reçues</h2>
          <p className="text-gray-500 text-sm">{stats.total} candidature{stats.total > 1 ? 's' : ''} au total</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            ✓ {success}
          </div>
        )}

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total',      value: stats.total,     color: 'text-gray-800',   bg: 'bg-white',           key: '' },
              { label: 'Nouvelles',  value: stats.nouvelles, color: 'text-blue-700',   bg: 'bg-blue-50',         key: 'soumise' },
              { label: 'Entretien', value: stats.entretien, color: 'text-purple-700', bg: 'bg-purple-50',       key: 'entretien' },
              { label: 'Acceptées',  value: stats.acceptees, color: 'text-green-700',  bg: 'bg-green-50',        key: 'acceptee' },
              { label: 'Refusées',   value: stats.refusees,  color: 'text-red-700',    bg: 'bg-red-50',          key: 'refusee' },
            ].map(s => (
              <button key={s.key}
                onClick={() => setFiltreStatut(filtreStatut === s.key ? '' : s.key)}
                className={`${s.bg} rounded-xl border p-4 text-left transition hover:opacity-80 ${filtreStatut === s.key ? 'ring-2 ring-green-400' : 'border-gray-100'}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* Filtre actif */}
        {filtreStatut && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Filtre :</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUTS[filtreStatut]?.color}`}>
              {STATUTS[filtreStatut]?.label}
            </span>
            <button onClick={() => setFiltreStatut('')} className="text-xs text-gray-400 hover:text-gray-600 ml-1">
              ✕ Effacer
            </button>
          </div>
        )}

        {/* Liste */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : liste.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">
              {filtreStatut ? `Aucune candidature avec le statut "${STATUTS[filtreStatut]?.label}".` : 'Aucune candidature reçue pour cette offre.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {liste.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Header candidature */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700 shrink-0">
                      {c.etudiant.prenom[0]}{c.etudiant.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        {c.etudiant.prenom} {c.etudiant.nom}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {c.etudiant.filiere} • {c.etudiant.niveauEtude}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUTS[c.statut]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUTS[c.statut]?.label ?? c.statut}
                  </span>
                </div>

                {/* Lettre de motivation */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Lettre de motivation</p>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{c.lettreMotivation}</p>
                </div>

                {/* Commentaire entreprise */}
                {c.commentaireEntreprise && (
                  <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Votre commentaire</p>
                    <p className="text-sm text-gray-700">{c.commentaireEntreprise}</p>
                  </div>
                )}

                {/* Pied de carte */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    Reçue le {new Date(c.dateCandidature).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Documents */}
                    {c.cvUrl && (
                      <a href={getFileUrl(c.cvUrl)} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded-lg transition">
                        📄 CV
                      </a>
                    )}
                    {c.documentsComplementaires?.lettre && (
                      <a href={getFileUrl(c.documentsComplementaires.lettre)} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1 rounded-lg transition">
                        ✉ Lettre
                      </a>
                    )}
                    {c.documentsComplementaires?.diplome && (
                      <a href={getFileUrl(c.documentsComplementaires.diplome)} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:text-orange-800 border border-orange-200 px-3 py-1 rounded-lg transition">
                        🎓 Diplôme
                      </a>
                    )}
                    <Link to={`/entreprise/candidatures/${c.id}/profil`}
                      className="text-xs text-purple-600 hover:text-purple-800 border border-purple-200 px-3 py-1 rounded-lg transition">
                      👤 Profil
                    </Link>
                    <button onClick={() => ouvrirModal(c, 'gerer')}
                      className="text-xs text-gray-600 hover:text-gray-800 border border-gray-200 px-3 py-1 rounded-lg transition">
                      ⚙ Gérer
                    </button>

                    {/* Actions principales */}
                    {c.statut !== 'acceptee' && c.statut !== 'refusee' && (
                      <>
                        <button onClick={() => ouvrirModal(c, 'acceptee')}
                          className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition flex items-center gap-1">
                          ✓ Accepter
                        </button>
                        <button onClick={() => ouvrirModal(c, 'refusee')}
                          className="text-xs font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition flex items-center gap-1">
                          ✕ Rejeter
                        </button>
                      </>
                    )}
                    {c.statut === 'acceptee' && (
                      <button onClick={() => ouvrirModal(c, 'refusee')}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg transition">
                        Annuler l'acceptation
                      </button>
                    )}
                    {c.statut === 'refusee' && (
                      <button onClick={() => ouvrirModal(c, 'acceptee')}
                        className="text-xs text-green-600 hover:text-green-800 border border-green-200 px-3 py-1 rounded-lg transition">
                        Reconsidérer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal confirmation */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            {/* Header modal */}
            <div className={`px-6 py-4 rounded-t-xl ${
              modal.action === 'acceptee' ? 'bg-green-50 border-b border-green-100' :
              modal.action === 'refusee'  ? 'bg-red-50 border-b border-red-100' :
              'bg-gray-50 border-b border-gray-100'
            }`}>
              <h3 className="font-semibold text-gray-800">
                {modal.action === 'acceptee' && '✓ Accepter la candidature'}
                {modal.action === 'refusee'  && '✕ Rejeter la candidature'}
                {modal.action === 'gerer'    && '⚙ Gérer la candidature'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {modal.candidature.etudiant.prenom} {modal.candidature.etudiant.nom} —{' '}
                {modal.candidature.etudiant.filiere}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Sélecteur statut (mode gérer) */}
              {modal.action === 'gerer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
                  <select value={customStatut} onChange={(e) => setCustomStatut(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="soumise">Soumise</option>
                    <option value="vue">Vue</option>
                    <option value="entretien">Entretien planifié</option>
                    <option value="acceptee">Acceptée</option>
                    <option value="refusee">Refusée</option>
                  </select>
                </div>
              )}

              {/* Message de confirmation (modes accepter/rejeter) */}
              {modal.action !== 'gerer' && (
                <p className="text-sm text-gray-600">
                  {modal.action === 'acceptee'
                    ? 'Vous êtes sur le point d\'accepter cette candidature. L\'étudiant en sera notifié.'
                    : 'Vous êtes sur le point de rejeter cette candidature. L\'étudiant en sera notifié.'}
                </p>
              )}

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
                  rows={3} placeholder={
                    modal.action === 'acceptee' ? 'Ex : Votre profil correspond parfaitement à nos attentes...' :
                    modal.action === 'refusee'  ? 'Ex : Votre profil ne correspond pas au poste pour le moment...' :
                    'Commentaire pour l\'étudiant...'
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
              </div>

              {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {erreur}
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-1">
                <button onClick={handleConfirmer} disabled={isUpdating}
                  className={`flex-1 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-white ${
                    modal.action === 'acceptee' ? 'bg-green-600 hover:bg-green-700' :
                    modal.action === 'refusee'  ? 'bg-red-500 hover:bg-red-600' :
                    'bg-gray-700 hover:bg-gray-800'
                  }`}>
                  {isUpdating ? 'Enregistrement...' :
                    modal.action === 'acceptee' ? '✓ Confirmer l\'acceptation' :
                    modal.action === 'refusee'  ? '✕ Confirmer le rejet' :
                    'Enregistrer'}
                </button>
                <button onClick={() => setModal(null)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}