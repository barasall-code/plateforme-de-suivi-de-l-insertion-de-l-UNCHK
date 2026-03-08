import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';

export default function MesEtudiants() {
  const [supervisions, setSupervisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    chargerEtudiants();
  }, []);

  const chargerEtudiants = async () => {
    try {
      const response = await api.get('/superviseur/etudiants');
      setSupervisions(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const statutColors: Record<string, string> = {
    soumise: 'bg-blue-100 text-blue-700',
    vue: 'bg-yellow-100 text-yellow-700',
    entretien: 'bg-purple-100 text-purple-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee: 'bg-red-100 text-red-700',
  };

  const supervisionsFiltrees = supervisions.filter(s => {
    const nom = `${s.etudiant.prenom} ${s.etudiant.nom}`.toLowerCase();
    return search === '' || nom.includes(search.toLowerCase());
  });

  const getDernierStatut = (candidatures: any[]) => {
    if (!candidatures || candidatures.length === 0) return null;
    return candidatures[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK — Superviseur</h1>
          <Link to="/superviseur/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mes étudiants</h2>
            <p className="text-gray-500 text-sm mt-1">{supervisions.length} étudiant{supervisions.length > 1 ? 's' : ''} suivi{supervisions.length > 1 ? 's' : ''}</p>
          </div>
          <BoutonExport label="Exporter liste" onClick={() => {
            const doc = genererPDF({
              titre: 'Liste des Étudiants Supervisés',
              sousTitre: `Total : ${supervisions.length} étudiant${supervisions.length > 1 ? 's' : ''}`,
              stats: [
                { label: 'Total étudiants', valeur: supervisions.length },
                { label: 'Avec candidatures', valeur: supervisions.filter(s => s.etudiant.candidatures?.length > 0).length },
                { label: 'Insertés', valeur: supervisions.filter(s => s.etudiant.candidatures?.some((c: any) => c.statut === 'acceptee')).length },
                { label: 'Taux insertion', valeur: supervisions.length > 0 ? Math.round(supervisions.filter(s => s.etudiant.candidatures?.some((c: any) => c.statut === 'acceptee')).length / supervisions.length * 100) + '%' : '0%' },
              ],
              tableaux: [{
                titre: 'Détail des étudiants supervisés',
                colonnes: ['Nom', 'Email', 'Filière', 'Niveau', 'Promo', 'Candidatures', 'Statut'],
                lignes: supervisions.map(s => [
                  `${s.etudiant.prenom} ${s.etudiant.nom}`,
                  s.etudiant.utilisateur?.email || '—',
                  s.etudiant.filiere || '—',
                  s.etudiant.niveauEtude || '—',
                  s.etudiant.promotion || '—',
                  s.etudiant.candidatures?.length || 0,
                  s.etudiant.candidatures?.some((c: any) => c.statut === 'acceptee') ? 'Insere' : 'En cours',
                ])
              }]
            });
            doc.save(`etudiants-supervises-${new Date().toISOString().slice(0,10)}.pdf`);
          }} />
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un étudiant..."
            className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : supervisionsFiltrees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucun étudiant trouvé</div>
        ) : (
          <div className="space-y-4">
            {supervisionsFiltrees.map((s) => {
              const derniereCandidature = getDernierStatut(s.etudiant.candidatures);
              return (
                <div key={s.etudiantId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-700">
                        {s.etudiant.prenom?.[0]}{s.etudiant.nom?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{s.etudiant.prenom} {s.etudiant.nom}</h3>
                        <p className="text-gray-500 text-sm">{s.etudiant.utilisateur?.email}</p>
                        <p className="text-gray-400 text-sm">{s.etudiant.filiere} • {s.etudiant.niveauEtude} • Promo {s.etudiant.promotion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.estActif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.estActif ? 'Actif' : 'Inactif'}
                      </span>
                      <Link to={`/superviseur/etudiants/${s.etudiantId}`}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                        Voir détail
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Candidatures</p>
                      <p className="text-lg font-bold text-gray-800">{s.etudiant.candidatures?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dernière candidature</p>
                      {derniereCandidature ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statutColors[derniereCandidature.statut] || 'bg-gray-100 text-gray-600'}`}>
                          {derniereCandidature.statut}
                        </span>
                      ) : (
                        <p className="text-sm text-gray-400">Aucune</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supervision depuis</p>
                      <p className="text-sm text-gray-700">{new Date(s.dateDebut).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  {s.commentaire && (
                    <div className="mt-4 bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 font-medium mb-1">Votre commentaire</p>
                      <p className="text-sm text-gray-700">{s.commentaire}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}