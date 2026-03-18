import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMesCandidatures, retirerCandidature } from '../../services/candidatures.service';
import type { Candidature } from '../../services/candidatures.service';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';

const statutConfig: Record<string, { label: string; color: string }> = {
  soumise: { label: 'Soumise', color: 'bg-blue-100 text-blue-700' },
  vue: { label: 'Vue', color: 'bg-yellow-100 text-yellow-700' },
  entretien: { label: 'Entretien', color: 'bg-purple-100 text-purple-700' },
  acceptee: { label: 'Acceptée ✓', color: 'bg-green-100 text-green-700' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
};

export default function MesCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    chargerCandidatures();
  }, []);

  const chargerCandidatures = async () => {
    try {
      const data = await getMesCandidatures();
      setCandidatures(data);
    } catch (err: any) {
      setError('Erreur lors du chargement des candidatures');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetirer = async (id: string) => {
    if (!confirm('Voulez-vous vraiment retirer cette candidature ?')) return;
    try {
      await retirerCandidature(id);
      setCandidatures(candidatures.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du retrait');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <div className="flex gap-4">
            <Link to="/offres" className="text-sm text-gray-600 hover:text-green-700">Offres</Link>
            <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50 shadow-sm hover:shadow-md transition-all duration-200 group">
            <span className="text-base group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Retour
          </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
  <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Mes candidatures</h2>
            <p className="text-gray-500">{candidatures.length} candidature{candidatures.length > 1 ? 's' : ''}</p>
          </div>
          <BoutonExport label="Exporter PDF" onClick={() => {
            const doc = genererPDF({
              titre: 'Mes Candidatures',
              sousTitre: `Total : ${candidatures.length} candidature${candidatures.length > 1 ? 's' : ''}`,
              stats: [
                { label: 'Total', valeur: candidatures.length },
                { label: 'Soumises', valeur: candidatures.filter(c => c.statut === 'soumise').length },
                { label: 'Entretiens', valeur: candidatures.filter(c => c.statut === 'entretien').length },
                { label: 'Acceptées', valeur: candidatures.filter(c => c.statut === 'acceptee').length },
                { label: 'Refusées', valeur: candidatures.filter(c => c.statut === 'refusee').length },
              ],
              tableaux: [{
                titre: 'Détail des candidatures',
                colonnes: ['Poste', 'Entreprise', 'Type', 'Statut', 'Date'],
                lignes: candidatures.map(c => [
                  c.offre.titre,
                  c.offre.entreprise.nomEntreprise,
                  c.offre.typeOffre,
                  statutConfig[c.statut]?.label || c.statut,
                  new Date(c.dateCandidature).toLocaleDateString('fr-FR'),
                ])
              }]
            });
            doc.save(`mes-candidatures-${new Date().toISOString().slice(0,10)}.pdf`);
          }} />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : candidatures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore postulé à une offre.</p>
            <Link to="/offres" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition">
              Voir les offres
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {candidatures.map((candidature) => {
              const statut = statutConfig[candidature.statut] || { label: candidature.statut, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={candidature.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{candidature.offre.titre}</h3>
                      <p className="text-gray-500 text-sm">
                        {candidature.offre.entreprise.nomEntreprise} • {candidature.offre.localisation}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statut.color}`}>
                        {statut.label}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {candidature.offre.typeOffre}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Lettre de motivation</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{candidature.lettreMotivation}</p>
                  </div>

                  {candidature.commentaireEntreprise && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">Commentaire de l'entreprise</p>
                      <p className="text-sm text-blue-800">{candidature.commentaireEntreprise}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Postulé le {new Date(candidature.dateCandidature).toLocaleDateString('fr-FR')}
                    </p>
                    {candidature.statut === 'soumise' && (
                      <button
                        onClick={() => handleRetirer(candidature.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Retirer la candidature
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}