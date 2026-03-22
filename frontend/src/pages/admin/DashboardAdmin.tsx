import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

function buildSerie(data: { mois: number; nombre: number }[]) {
  return MOIS.map((label, i) => {
    const found = data.find(d => d.mois === i + 1);
    return { name: label, value: found?.nombre ?? 0 };
  });
}

export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [avancees, setAvancees] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'synthese' | 'avancees'>('synthese');

  // Filters
  const [annee, setAnnee]     = useState(new Date().getFullYear());
  const [filiere, setFiliere] = useState('');
  const [typeOffre, setTypeOffre] = useState('');
  const [secteur, setSecteur]     = useState('');

  useEffect(() => { chargerStats(); }, []);
  useEffect(() => {
    if (activeTab === 'avancees') chargerAvancees();
  }, [activeTab, annee, filiere, typeOffre, secteur]);

  const chargerStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const chargerAvancees = async () => {
    try {
      const params = new URLSearchParams();
      params.set('annee', String(annee));
      if (filiere)   params.set('filiere', filiere);
      if (typeOffre) params.set('typeOffre', typeOffre);
      if (secteur)   params.set('secteurActivite', secteur);
      const res = await api.get(`/admin/stats/avancees?${params.toString()}`);
      setAvancees(res.data.data);
    } catch {
      // erreur silencieuse
    }
  };

  const barData = stats ? [
    { label: 'Étudiants', value: stats.totalEtudiants, color: '#3B82F6' },
    { label: 'Entreprises', value: stats.totalEntreprises, color: '#10B981' },
    { label: 'Offres', value: stats.totalOffres, color: '#F59E0B' },
    { label: 'Candidatures', value: stats.totalCandidatures, color: '#8B5CF6' },
  ] : [];

  const pieData = stats ? [
    { name: 'Publiées', value: stats.offresPubliees, color: '#10B981' },
    { name: 'Autres', value: stats.totalOffres - stats.offresPubliees, color: '#E5E7EB' },
  ] : [];

  const pieEntreprises = stats ? [
    { name: 'Validées', value: stats.totalEntreprises - stats.entreprisesEnAttente, color: '#10B981' },
    { name: 'En attente', value: stats.entreprisesEnAttente, color: '#F59E0B' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/admin/offres', label: '📋 Valider offres' },
              { to: '/admin/superviseurs', label: '👁️ Superviseurs' },
              { to: '/admin/entreprises', label: '🏢 Entreprises' },
              { to: '/admin/utilisateurs', label: '👥 Utilisateurs' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 transition-all duration-150">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm text-gray-700 font-medium max-w-32 truncate">{user?.email}</span>
                <span className="text-xs text-red-600 font-medium">Administrateur</span>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all">
              <span>↗</span>
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Tableau de bord administrateur</h2>
          {stats && (
            <BoutonExport label="Exporter rapport admin" onClick={() => {
              const doc = genererPDF({
                titre: 'Rapport Administrateur UNCHK',
                sousTitre: `Exporté par ${user?.email}`,
                stats: [
                  { label: 'Étudiants', valeur: stats.totalEtudiants },
                  { label: 'Entreprises', valeur: stats.totalEntreprises },
                  { label: 'Offres publiées', valeur: stats.offresPubliees },
                  { label: 'Candidatures', valeur: stats.totalCandidatures },
                  { label: 'Taux insertion', valeur: stats.tauxInsertion + '%' },
                ],
                tableaux: [{
                  titre: 'Statistiques globales de la plateforme',
                  colonnes: ['Indicateur', 'Valeur'],
                  lignes: [
                    ['Total utilisateurs', stats.totalUtilisateurs],
                    ['Étudiants inscrits', stats.totalEtudiants],
                    ['Entreprises validées', stats.totalEntreprises],
                    ['Offres publiées', stats.offresPubliees],
                    ['Total candidatures', stats.totalCandidatures],
                    ['Taux d\'insertion', stats.tauxInsertion + '%'],
                  ]
                }]
              });
              doc.save(`rapport-admin-${new Date().toISOString().slice(0, 10)}.pdf`);
            }} />
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Étudiants', value: stats?.totalEtudiants, color: 'text-gray-800', bg: 'bg-white', icon: '🎓' },
                { label: 'Entreprises', value: stats?.totalEntreprises, color: 'text-blue-600', bg: 'bg-white', icon: '🏢' },
                { label: 'Offres publiées', value: stats?.offresPubliees, color: 'text-green-600', bg: 'bg-white', icon: '📋' },
                { label: 'Candidatures', value: stats?.totalCandidatures, color: 'text-purple-600', bg: 'bg-white', icon: '📝' },
                { label: 'Total offres', value: stats?.totalOffres, color: 'text-orange-500', bg: 'bg-white', icon: '📌' },
                { label: 'En attente validation', value: stats?.entreprisesEnAttente, color: 'text-yellow-500', bg: stats?.entreprisesEnAttente > 0 ? 'bg-yellow-50' : 'bg-white', icon: '⏳' },
                { label: 'Candidatures acceptées', value: stats?.candidaturesAcceptees, color: 'text-emerald-600', bg: 'bg-white', icon: '✅' },
                { label: 'Taux d\'insertion', value: `${stats?.tauxInsertion ?? 0}%`, color: 'text-red-600', bg: 'bg-red-50', icon: '📊' },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.bg} rounded-xl border border-gray-100 shadow-sm p-5`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-gray-500 text-xs mt-1">{kpi.label}</p>
                    </div>
                    <span className="text-2xl opacity-60">{kpi.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'synthese', label: '📊 Synthèse globale' },
                { key: 'avancees', label: '🔎 Statistiques avancées' },
              ].map(tab => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'synthese' | 'avancees')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* === TAB: SYNTHESE === */}
            {activeTab === 'synthese' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Vue globale</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Total" radius={[6, 6, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Statut des offres</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                          dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Validation entreprises</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieEntreprises} cx="50%" cy="50%" outerRadius={80}
                          dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                          {pieEntreprises.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Navigation cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { to: '/admin/offres', icon: '📋', title: 'Valider les offres', desc: 'Publier et gérer les offres des entreprises', badge: stats?.totalOffres - stats?.offresPubliees, badgeColor: 'bg-amber-100 text-amber-700', borderHover: 'hover:border-amber-300' },
                    { to: '/admin/entreprises', icon: '🏢', title: 'Gérer les entreprises', desc: 'Valider, rejeter et gérer les comptes entreprises', badge: stats?.entreprisesEnAttente, badgeColor: 'bg-yellow-100 text-yellow-700', borderHover: 'hover:border-yellow-300' },
                    { to: '/admin/utilisateurs', icon: '👥', title: 'Gérer les utilisateurs', desc: 'Activer, désactiver et gérer tous les comptes', badge: 0, badgeColor: '', borderHover: 'hover:border-blue-300' },
                    { to: '/admin/superviseurs', icon: '👁️', title: 'Gérer les superviseurs', desc: 'Créer et assigner des superviseurs pédagogiques', badge: 0, badgeColor: '', borderHover: 'hover:border-purple-300' },
                  ].map(card => (
                    <Link key={card.to} to={card.to}
                      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${card.borderHover} hover:shadow-md transition block`}>
                      <div className="text-3xl mb-3">{card.icon}</div>
                      <h3 className="font-semibold text-gray-800 mb-1">{card.title}</h3>
                      <p className="text-gray-500 text-sm">{card.desc}</p>
                      {card.badge > 0 && (
                        <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                          {card.badge} en attente
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* === TAB: AVANCEES === */}
            {activeTab === 'avancees' && (
              <>
                {/* Filtres */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4">🔎 Filtres d'analyse</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Année académique</label>
                      <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                        {[2024, 2025, 2026, 2027].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Filière</label>
                      <input value={filiere} onChange={e => setFiliere(e.target.value)}
                        placeholder="Ex: Informatique"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type d'offre</label>
                      <select value={typeOffre} onChange={e => setTypeOffre(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                        <option value="">Tous</option>
                        {['stage', 'alternance', 'cdi', 'cdd', 'freelance'].map(t => (
                          <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Secteur d'activité</label>
                      <input value={secteur} onChange={e => setSecteur(e.target.value)}
                        placeholder="Ex: Technologie"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                    </div>
                  </div>
                </div>

                {!avancees ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📊</div>
                    <p>Chargement des statistiques avancées...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Entonnoir de conversion */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">📉 Entonnoir de conversion des candidatures ({avancees.annee})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Total candidatures', value: avancees.entonnoir.totalCandidatures, pct: 100, color: 'bg-blue-100 text-blue-700' },
                          { label: 'Vues', value: avancees.entonnoir.vues, pct: avancees.entonnoir.tauxVue, color: 'bg-yellow-100 text-yellow-700' },
                          { label: 'Entretiens', value: avancees.entonnoir.entretiens, pct: avancees.entonnoir.tauxEntretien, color: 'bg-purple-100 text-purple-700' },
                          { label: 'Acceptées', value: avancees.entonnoir.acceptees, pct: avancees.entonnoir.tauxAcceptation, color: 'bg-green-100 text-green-700' },
                        ].map(item => (
                          <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
                            <p className="text-3xl font-bold">{item.value}</p>
                            <p className="text-xs font-medium mt-1">{item.label}</p>
                            <p className="text-sm font-bold mt-1">{item.pct}%</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Candidatures & inscriptions par mois */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">📅 Candidatures par mois</h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={buildSerie(avancees.candidaturesParMois)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" name="Candidatures" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">🎓 Inscriptions étudiants par mois</h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={buildSerie(avancees.inscriptionsParMois)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" name="Inscriptions" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Par filière et par niveau */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">🎓 Répartition par filière</h3>
                        {avancees.parFiliere.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={avancees.parFiliere.slice(0, 8)} layout="vertical"
                              margin={{ top: 5, right: 15, left: 60, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                              <YAxis type="category" dataKey="filiere" tick={{ fontSize: 10 }} width={60} />
                              <Tooltip />
                              <Bar dataKey="nombre" name="Étudiants" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">📚 Niveau d'étude</h3>
                        {avancees.parNiveau.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie data={avancees.parNiveau.map((r: any) => ({ name: r.niveau, value: r.nombre }))}
                                cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                label={({ name, value }) => `${name} (${value})`}>
                                {avancees.parNiveau.map((_: any, i: number) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Type d'offres & situation étudiants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">💼 Type d'offres publiées</h3>
                        {avancees.parTypeOffre.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={avancees.parTypeOffre.map((r: any) => ({ name: r.type.toUpperCase(), value: r.nombre }))}
                              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="value" name="Offres" radius={[6, 6, 0, 0]}>
                                {avancees.parTypeOffre.map((_: any, i: number) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">🏷️ Situation des étudiants</h3>
                        {avancees.parSituation.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>
                        ) : (
                          <div className="space-y-3">
                            {avancees.parSituation.map((s: any, i: number) => {
                              const total = avancees.parSituation.reduce((acc: number, x: any) => acc + x.nombre, 0);
                              const pct = total > 0 ? Math.round((s.nombre / total) * 100) : 0;
                              return (
                                <div key={i}>
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{s.situation?.replace(/_/g, ' ') ?? 'N/A'}</span>
                                    <span className="font-medium">{s.nombre} ({pct}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top secteurs */}
                    {avancees.topSecteurs.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">🏭 Top secteurs d'activité</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 rounded-lg">
                                <th className="text-left px-4 py-2 font-semibold text-gray-600 rounded-l-lg">Secteur</th>
                                <th className="text-right px-4 py-2 font-semibold text-gray-600">Offres</th>
                                <th className="text-right px-4 py-2 font-semibold text-gray-600 rounded-r-lg">Candidatures</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {avancees.topSecteurs.map((s: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-gray-700">{s.secteur}</td>
                                  <td className="px-4 py-2 text-right font-medium text-blue-600">{s.offres}</td>
                                  <td className="px-4 py-2 text-right font-medium text-purple-600">{s.candidatures}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}


export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const barData = stats ? [
    { label: 'Étudiants', value: stats.totalEtudiants, color: '#3B82F6' },
    { label: 'Entreprises', value: stats.totalEntreprises, color: '#10B981' },
    { label: 'Offres', value: stats.totalOffres, color: '#F59E0B' },
    { label: 'Candidatures', value: stats.totalCandidatures, color: '#8B5CF6' },
  ] : [];

  const pieData = stats ? [
    { name: 'Offres publiées', value: stats.offresPubliees, color: '#10B981' },
    { name: 'Brouillons', value: stats.totalOffres - stats.offresPubliees, color: '#E5E7EB' },
  ] : [];

  const pieEntreprises = stats ? [
    { name: 'Validées', value: stats.totalEntreprises - stats.entreprisesEnAttente, color: '#10B981' },
    { name: 'En attente', value: stats.entreprisesEnAttente, color: '#F59E0B' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/admin/offres', label: '📋 Valider offres' },
              { to: '/admin/superviseurs', label: '👁️ Superviseurs' },
              { to: '/admin/entreprises', label: '🏢 Entreprises' },
              { to: '/admin/utilisateurs', label: '👥 Utilisateurs' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 transition-all duration-150">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm text-gray-700 font-medium max-w-32 truncate">{user?.email}</span>
                <span className="text-xs text-red-600 font-medium">Administrateur</span>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all">
              <span>↗</span>
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
  <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Tableau de bord administrateur</h2>
          <BoutonExport label="Exporter rapport admin" onClick={() => {
            const doc = genererPDF({
              titre: 'Rapport Administrateur UNCHK',
              sousTitre: `Exporté par ${user?.email}`,
              stats: [
                { label: 'Utilisateurs', valeur: stats.totalUtilisateurs },
                { label: 'Étudiants', valeur: stats.totalEtudiants },
                { label: 'Entreprises', valeur: stats.totalEntreprises },
                { label: 'Offres publiées', valeur: stats.offresPubliees },
                { label: 'Candidatures', valeur: stats.totalCandidatures },
                { label: 'Taux insertion', valeur: stats.tauxInsertion + '%' },
              ],
              tableaux: [{
                titre: 'Statistiques globales de la plateforme',
                colonnes: ['Indicateur', 'Valeur'],
                lignes: [
                  ['Total utilisateurs', stats.totalUtilisateurs],
                  ['Étudiants inscrits', stats.totalEtudiants],
                  ['Entreprises validées', stats.totalEntreprises],
                  ['Offres publiées', stats.offresPubliees],
                  ['Total candidatures', stats.totalCandidatures],
                  ['Taux d\'insertion', stats.tauxInsertion + '%'],
                ]
              }]
            });
            doc.save(`rapport-admin-${new Date().toISOString().slice(0,10)}.pdf`);
          }} />
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-gray-800">{stats?.totalEtudiants}</p>
                <p className="text-gray-500 text-sm mt-1">Étudiants</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-blue-600">{stats?.totalEntreprises}</p>
                <p className="text-gray-500 text-sm mt-1">Entreprises</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-600">{stats?.offresPubliees}</p>
                <p className="text-gray-500 text-sm mt-1">Offres publiées</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-purple-600">{stats?.totalCandidatures}</p>
                <p className="text-gray-500 text-sm mt-1">Candidatures</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-orange-500">{stats?.totalOffres}</p>
                <p className="text-gray-500 text-sm mt-1">Total offres</p>
              </div>
              <div className={`bg-white rounded-xl border shadow-sm p-5 ${stats?.entreprisesEnAttente > 0 ? 'border-yellow-300' : 'border-gray-100'}`}>
                <p className="text-3xl font-bold text-yellow-500">{stats?.entreprisesEnAttente}</p>
                <p className="text-gray-500 text-sm mt-1">En attente validation</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Bar chart global */}
              <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Vue globale</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Total" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie offres */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Statut des offres</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie entreprises */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Validation entreprises</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieEntreprises} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {pieEntreprises.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/admin/offres"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-amber-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-800 mb-1">Valider les offres</h3>
                <p className="text-gray-500 text-sm">Publier et gérer les offres des entreprises</p>
                {(stats?.totalOffres - stats?.offresPubliees) > 0 && (
                  <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {stats.totalOffres - stats.offresPubliees} en attente
                  </span>
                )}
              </Link>
              <Link to="/admin/entreprises"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="font-semibold text-gray-800 mb-1">Gérer les entreprises</h3>
                <p className="text-gray-500 text-sm">Valider, rejeter et gérer les comptes entreprises</p>
                {stats?.entreprisesEnAttente > 0 && (
                  <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {stats.entreprisesEnAttente} en attente
                  </span>
                )}
              </Link>
              <Link to="/admin/utilisateurs"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-800 mb-1">Gérer les utilisateurs</h3>
                <p className="text-gray-500 text-sm">Activer, désactiver et gérer tous les comptes</p>
              </Link>
            </div>
          </>
        )}
                {/* Carte superviseurs */}
          <div className="mt-4">
            <Link to="/admin/superviseurs"
              className="flex items-center gap-3 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
              <span className="text-3xl">��️</span>
              <div>
                <p className="font-semibold text-gray-800">Gérer les superviseurs</p>
                <p className="text-sm text-gray-500">Créer et assigner des superviseurs</p>
              </div>
            </Link>
          </div>
        </main>
    </div>
  );
}