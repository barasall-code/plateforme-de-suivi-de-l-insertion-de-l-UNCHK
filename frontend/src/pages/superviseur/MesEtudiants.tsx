import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Notifications from '../../components/Notifications';
import api from '../../services/api';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';

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

export default function MesEtudiants() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [supervisions, setSupervisions] = useState<any[]>([]);
  const [tousEtudiants, setTousEtudiants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreSituation, setFiltreSituation] = useState(searchParams.get('situation') ?? '');
  const [modeVue, setModeVue] = useState<'supervises' | 'tous'>(searchParams.get('situation') ? 'tous' : 'supervises');
  const [derniereMaj, setDerniereMaj] = useState<Date | null>(null);

  const chargerDonnees = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        api.get('/superviseur/etudiants'),
        api.get('/superviseur/tous-etudiants'),
      ]);
      setSupervisions(r1.data.data || []);
      setTousEtudiants(r2.data.data || []);
      setDerniereMaj(new Date());
      if (r1.data.data?.length === 0) setModeVue('tous');
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
    const interval = setInterval(() => chargerDonnees(true), 30000);
    return () => clearInterval(interval);
  }, [chargerDonnees]);

  const statutColors: Record<string, string> = {
    soumise:  'bg-blue-100 text-blue-700',
    vue:      'bg-yellow-100 text-yellow-700',
    entretien:'bg-purple-100 text-purple-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee:  'bg-red-100 text-red-700',
  };

  const statutLabels: Record<string, string> = {
    soumise:  'Soumise',
    vue:      'Vue',
    entretien:'Entretien',
    acceptee: 'Acceptée',
    refusee:  'Refusée',
  };

  // Données actives selon le mode
  const donneesActives = modeVue === 'supervises'
    ? supervisions.map(s => ({ ...s.etudiant, supervisionInfo: s, _mode: 'supervise' }))
    : tousEtudiants.map(e => ({ ...e, _mode: 'global' }));

  const donneesFiltrees = donneesActives.filter(e => {
    const nom = `${e.prenom} ${e.nom}`.toLowerCase();
    const matchSearch = search === '' || nom.includes(search.toLowerCase());
    const matchSituation = filtreSituation === '' || e.situationActuelle === filtreSituation;
    return matchSearch && matchSituation;
  });

  const getDerniereCandidature = (candidatures: any[]) => {
    if (!candidatures || candidatures.length === 0) return null;
    return candidatures[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/superviseur/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/superviseur/etudiants', label: '🎓 Mes étudiants' },
              { to: '/offres', label: '💼 Offres' },
              { to: '/superviseur/profil', label: '👤 Mon profil' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-150">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Notifications />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all">
              <span>↗</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Suivi des étudiants</h2>
            <p className="text-gray-500 text-sm mt-1">
              {donneesFiltrees.length} étudiant{donneesFiltrees.length > 1 ? 's' : ''}
              {derniereMaj && (
                <span className="ml-3 text-gray-400">
                  · Mis à jour à {derniereMaj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
          <BoutonExport label="Exporter liste" onClick={() => {
            const source = modeVue === 'supervises' ? supervisions.map(s => s.etudiant) : tousEtudiants;
            const doc = genererPDF({
              titre: modeVue === 'supervises' ? 'Liste des Étudiants Supervisés' : 'Liste Globale des Étudiants',
              sousTitre: `Total : ${source.length} étudiant${source.length > 1 ? 's' : ''}`,
              stats: [
                { label: 'Total étudiants', valeur: source.length },
                { label: 'Avec candidatures', valeur: source.filter((e: any) => e.candidatures?.length > 0).length },
                { label: 'Insertés', valeur: source.filter((e: any) => e.candidatures?.some((c: any) => c.statut === 'acceptee')).length },
                { label: 'En cours étude', valeur: source.filter((e: any) => (e.situationActuelle || 'en_cours_etude') === 'en_cours_etude').length },
              ],
              tableaux: [{
                titre: 'Détail des étudiants',
                colonnes: ['Nom', 'Email', 'Filière', 'Niveau', 'Promo', 'Statut actuel', 'Candidatures'],
                lignes: source.map((e: any) => [
                  `${e.prenom} ${e.nom}`,
                  e.utilisateur?.email || '—',
                  e.filiere || '—',
                  e.niveauEtude || '—',
                  e.promotion || '—',
                  SITUATION_LABELS[e.situationActuelle || 'en_cours_etude'] || '—',
                  e.candidatures?.length || 0,
                ])
              }]
            });
            doc.save(`etudiants-${modeVue}-${new Date().toISOString().slice(0,10)}.pdf`);
          }} />
        </div>

        {/* Onglets mode vue */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setModeVue('supervises')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${modeVue === 'supervises' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            👥 Mes étudiants ({supervisions.length})
          </button>
          <button
            onClick={() => setModeVue('tous')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${modeVue === 'tous' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            🌍 Tous les étudiants ({tousEtudiants.length})
          </button>
          <button onClick={() => chargerDonnees(true)}
            className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
            🔄 Actualiser
          </button>
        </div>

        {/* Barre de filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un étudiant..."
            className="flex-1 min-w-60 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <select value={filtreSituation} onChange={(e) => setFiltreSituation(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm">
            <option value="">Tous les statuts</option>
            {Object.entries(SITUATION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Compteurs par statut */}
        {tousEtudiants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(SITUATION_LABELS).map(([val, label]) => {
              const source = modeVue === 'tous' ? tousEtudiants : supervisions.map(s => s.etudiant);
              const count = source.filter((e: any) => (e.situationActuelle || 'en_cours_etude') === val).length;
              if (count === 0) return null;
              return (
                <button key={val}
                  onClick={() => setFiltreSituation(filtreSituation === val ? '' : val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${filtreSituation === val ? SITUATION_COLORS[val] + ' border-current' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {label} <span className="font-bold ml-1">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : donneesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-gray-500 font-medium">Aucun étudiant trouvé</p>
            {modeVue === 'supervises' && supervisions.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">
                Aucun étudiant ne vous est encore affecté.{' '}
                <button onClick={() => setModeVue('tous')} className="text-green-600 hover:underline">
                  Voir tous les étudiants →
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {donneesFiltrees.map((e) => {
              const derniereC = getDerniereCandidature(e.candidatures);
              const estSupervise = modeVue === 'supervises' || e.supervisions?.some((sv: any) => sv.estActif);
              const etudiantId = e.id;
              const supInfo = e.supervisionInfo;
              return (
                <div key={etudiantId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-700">
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{e.prenom} {e.nom}</h3>
                          {/* Badge situationActuelle */}
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SITUATION_COLORS[e.situationActuelle || 'en_cours_etude'] ?? 'bg-gray-100 text-gray-600'}`}>
                            {SITUATION_LABELS[e.situationActuelle || 'en_cours_etude'] ?? e.situationActuelle}
                          </span>
                          {estSupervise && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                              Supervisé
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">{e.utilisateur?.email}</p>
                        <p className="text-gray-400 text-sm">{e.filiere} • {e.niveauEtude} • Promo {e.promotion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {supInfo && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${supInfo.estActif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {supInfo.estActif ? 'Actif' : 'Inactif'}
                        </span>
                      )}
                      <Link to={`/superviseur/etudiants/${etudiantId}`}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                        Voir détail
                      </Link>
                      {modeVue === 'tous' && !supervisions.find(s => s.etudiantId === etudiantId) && (
                        <button
                          onClick={async () => {
                            try {
                              await api.post('/superviseur/supervisions', { etudiantId });
                              alert('Étudiant ajouté à vos supervisions !');
                              chargerDonnees();
                            } catch { alert('Erreur lors de la supervision'); }
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition">
                          + Superviser
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Candidatures</p>
                      <p className="text-lg font-bold text-gray-800">{e.candidatures?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dernière candidature</p>
                      {derniereC ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statutColors[derniereC.statut] || 'bg-gray-100 text-gray-600'}`}>
                          {statutLabels[derniereC.statut] || derniereC.statut}
                        </span>
                      ) : (
                        <p className="text-sm text-gray-400">Aucune</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {supInfo ? 'Supervision depuis' : 'Inscrit le'}
                      </p>
                      <p className="text-sm text-gray-700">
                        {supInfo
                          ? new Date(supInfo.dateDebut).toLocaleDateString('fr-FR')
                          : e.utilisateur?.dateCreation
                            ? new Date(e.utilisateur.dateCreation).toLocaleDateString('fr-FR')
                            : '—'}
                      </p>
                    </div>
                  </div>

                  {supInfo?.commentaire && (
                    <div className="mt-4 bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 font-medium mb-1">Votre commentaire</p>
                      <p className="text-sm text-gray-700">{supInfo.commentaire}</p>
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