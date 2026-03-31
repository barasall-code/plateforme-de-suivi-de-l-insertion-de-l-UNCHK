import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IndicateursPedagogiques() {
  const [stats, setStats] = useState<any>(null);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/superviseur/stats'),
      api.get('/superviseur/etudiants'),
    ]).then(([s, e]) => {
      setStats(s.data?.data);
      setEtudiants(e.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-purple-600"></i></div>;

  // Calcul indicateurs pédagogiques
  const SITUATION_LABELS_FR: Record<string, string> = {
    en_cours_etude: 'En études', en_stage: 'En stage', sous_contrat_cdi: 'CDI',
    sous_contrat_cdd: 'CDD', sous_contrat_stage: 'Stage pro', freelance: 'Freelance',
    entrepreneur: 'Entrepreneur', en_formation_continue: 'Formation', 
    en_recherche_emploi: 'Recherche', expatrie: 'Expatrié', sans_activite: 'Inactif'
  };
  const parFiliere = Object.entries(stats?.parSituationActuelle || {}).map(([k,v]) => ({filiere: SITUATION_LABELS_FR[k] || k, nombre: v})).filter(x => (x.nombre as number) > 0);
  const parNiveau = stats?.parNiveauEtude ? Object.entries(stats.parNiveauEtude).filter(([k,v]) => (v as number) > 0).map(([k,v]) => ({niveau: k, nombre: v})) : [];
  const parTypeOffre = stats?.parTypeContrat ? Object.entries(stats.parTypeContrat).filter(([k,v]) => (v as number) > 0).map(([k,v]) => ({type: k, nombre: v})) : [];
  const total = stats?.totalEtudiants || etudiants.length;
  const inserés = etudiants.filter((e: any) =>
    e.etudiant?.situationActuelle && e.etudiant.situationActuelle !== 'en_cours_etude' && e.etudiant.situationActuelle !== 'en_recherche_emploi'
  ).length;
  const tauxInsertion = stats?.tauxInsertion || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2"><img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-2">
            {[
              { to: '/superviseur/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
              { to: '/superviseur/etudiants', label: 'Mes étudiants', icon: 'fa-solid fa-graduation-cap' },
              { to: '/superviseur/indicateurs', label: 'Indicateurs', icon: 'fa-solid fa-chart-bar' },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition flex items-center gap-1">
                <i className={icon}></i> {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <i className="fa-solid fa-chart-bar mr-2 text-purple-600"></i>
            Indicateurs pédagogiques
          </h1>
          <p className="text-gray-500 mt-1">Évaluation de l'efficacité des formations et débouchés par filière</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Étudiants suivis', value: total, icon: 'fa-solid fa-graduation-cap', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Taux insertion', value: tauxInsertion + '%', icon: 'fa-solid fa-arrow-trend-up', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Filières actives', value: parFiliere.length, icon: 'fa-solid fa-book', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Types d\'offres', value: parTypeOffre.length, icon: 'fa-solid fa-briefcase', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-3">
                <i className={`${kpi.icon} ${kpi.color} text-2xl`}></i>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Étudiants par filière */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-book mr-2 text-purple-600"></i>
              Étudiants par filière
            </h3>
            {parFiliere.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={parFiliere}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="filiere" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="nombre" fill="#7c3aed" radius={[4,4,0,0]} name="Étudiants" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-8">Données insuffisantes</p>}
          </div>

          {/* Offres par type */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-briefcase mr-2 text-orange-600"></i>
              Débouchés — Types d'offres disponibles
            </h3>
            {parTypeOffre.length > 0 ? (
              <div className="space-y-3">
                {parTypeOffre.map((t: any) => {
                  const total = parTypeOffre.reduce((a: number, x: any) => a + x.nombre, 0);
                  const pct = Math.round(t.nombre / total * 100);
                  const colors: Record<string, string> = { cdi: 'bg-green-500', cdd: 'bg-yellow-500', stage: 'bg-blue-500', alternance: 'bg-purple-500', freelance: 'bg-orange-500' };
                  return (
                    <div key={t.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 uppercase">{t.type}</span>
                        <span className="text-gray-500">{t.nombre} offres ({pct}%)</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-3">
                        <div className={`${colors[t.type] || 'bg-gray-400'} h-3 rounded-full`} style={{width: pct + '%'}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-400 text-sm text-center py-8">Données insuffisantes</p>}
          </div>

          {/* Niveau des étudiants */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-layer-group mr-2 text-blue-600"></i>
              Répartition par niveau d'études
            </h3>
            {parNiveau.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={parNiveau}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="niveau" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="nombre" fill="#2563eb" radius={[4,4,0,0]} name="Étudiants" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-8">Données insuffisantes</p>}
          </div>

          {/* Situation de mes étudiants */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-users mr-2 text-green-600"></i>
              Situation de mes étudiants
            </h3>
            {etudiants.length > 0 ? (
              <div className="space-y-2">
                {etudiants.slice(0, 6).map((e: any) => {
                  const LABELS: Record<string, string> = {
                    en_cours_etude: 'En études', en_stage: 'En stage',
                    sous_contrat_cdi: 'CDI', sous_contrat_cdd: 'CDD', sous_contrat_stage: 'Stage pro',
                    en_recherche_emploi: 'En recherche', freelance: 'Freelance',
                  };
                  const sit = e.etudiant?.situationActuelle;
                  return (
                    <div key={e.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold">
                          {e.etudiant?.prenom?.[0]}{e.etudiant?.nom?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{e.etudiant?.prenom} {e.etudiant?.nom}</p>
                          <p className="text-xs text-gray-400">{e.etudiant?.filiere}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {LABELS[sit] || sit || 'Non renseigné'}
                      </span>
                    </div>
                  );
                })}
                {etudiants.length > 6 && (
                  <Link to="/superviseur/etudiants" className="text-xs text-purple-600 hover:underline block text-center mt-2">
                    Voir tous ({etudiants.length}) →
                  </Link>
                )}
              </div>
            ) : <p className="text-gray-400 text-sm text-center py-8">Aucun étudiant assigné</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
