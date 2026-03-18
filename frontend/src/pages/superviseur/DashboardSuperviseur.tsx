import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Notifications from '../../components/Notifications';
import api from '../../services/api';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, Legend
} from 'recharts';

const SITUATION_LABELS: Record<string, string> = {
  en_cours_etude:    "En cours d'étude",
  sous_contrat_stage: 'Sous contrat stage',
  sous_contrat_cdd:  'Sous contrat CDD',
  sous_contrat_cdi:  'Sous contrat CDI',
  chomeur:           'Chômeur',
};

const SITUATION_COLORS_HEX: Record<string, string> = {
  en_cours_etude:    '#3B82F6',
  sous_contrat_stage: '#8B5CF6',
  sous_contrat_cdd:  '#F59E0B',
  sous_contrat_cdi:  '#10B981',
  chomeur:           '#EF4444',
};

const SITUATION_BG: Record<string, string> = {
  en_cours_etude:    'bg-blue-100 text-blue-700',
  sous_contrat_stage: 'bg-purple-100 text-purple-700',
  sous_contrat_cdd:  'bg-yellow-100 text-yellow-700',
  sous_contrat_cdi:  'bg-green-100 text-green-700',
  chomeur:           'bg-red-100 text-red-700',
};

export default function DashboardSuperviseur() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [derniereMaj, setDerniereMaj] = useState<Date | null>(null);

  const chargerStats = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await api.get('/superviseur/stats');
      setStats(response.data.data);
      setDerniereMaj(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerStats();
    const interval = setInterval(() => chargerStats(true), 30000);
    return () => clearInterval(interval);
  }, [chargerStats]);

  const pieCandidatures = stats ? [
    { name: 'Acceptées', value: stats.accepteesPlateform ?? stats.candidaturesAcceptees, color: '#10B981' },
    { name: 'En cours',  value: stats.enCoursPlateform  ?? stats.candidaturesEnCours,   color: '#F59E0B' },
    { name: 'Autres',    value: Math.max(0, (stats.totalCandidaturesPlateform ?? stats.totalCandidatures) - (stats.accepteesPlateform ?? stats.candidaturesAcceptees) - (stats.enCoursPlateform ?? stats.candidaturesEnCours)), color: '#EF4444' },
  ].filter(d => d.value > 0) : [];

  const radialDataPlateform = stats ? [
    { name: 'Taux d\'insertion', value: stats.tauxInsertionPlateform ?? stats.tauxInsertion, fill: '#10B981' },
  ] : [];

  const pieSituation = stats?.parSituationActuelle
    ? Object.entries(stats.parSituationActuelle)
        .filter(([, v]) => (v as number) > 0)
        .map(([key, value]) => ({
          name: SITUATION_LABELS[key] || key,
          value: value as number,
          color: SITUATION_COLORS_HEX[key] || '#9CA3AF',
        }))
    : [];

  const statutColors: Record<string, string> = {
    soumise:   'bg-blue-100 text-blue-700',
    vue:       'bg-yellow-100 text-yellow-700',
    entretien: 'bg-purple-100 text-purple-700',
    acceptee:  'bg-green-100 text-green-700',
    refusee:   'bg-red-100 text-red-700',
  };
  const statutLabels: Record<string, string> = {
    soumise: 'Soumise', vue: 'Vue', entretien: 'Entretien', acceptee: 'Acceptée', refusee: 'Refusée',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm text-gray-700 font-medium max-w-32 truncate">{user?.email}</span>
                <span className="text-xs text-purple-600 font-medium">Superviseur</span>
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h2>
            <p className="text-gray-500">Suivi de l'insertion professionnelle — Plateforme UNCHK</p>
            {derniereMaj && (
              <p className="text-xs text-gray-400 mt-1">
                Mis à jour à {derniereMaj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                <button onClick={() => chargerStats(true)} className="ml-3 text-green-600 hover:underline">↻ Actualiser</button>
              </p>
            )}
          </div>
          <BoutonExport label="Exporter rapport" onClick={() => {
            const doc = genererPDF({
              titre: 'Rapport d\'Insertion Professionnelle — UNCHK',
              sousTitre: `Superviseur : ${user?.email}`,
              stats: [
                { label: 'Étudiants (plateforme)', valeur: stats?.totalEtudiantsPlateform ?? 0 },
                { label: 'Étudiants supervisés', valeur: stats?.totalEtudiants ?? 0 },
                { label: 'Total candidatures', valeur: stats?.totalCandidaturesPlateform ?? 0 },
                { label: 'Candidatures acceptées', valeur: stats?.accepteesPlateform ?? 0 },
                { label: 'Taux insertion plateforme', valeur: (stats?.tauxInsertionPlateform ?? 0) + '%' },
                { label: 'Taux insertion (mes supervisés)', valeur: (stats?.tauxInsertion ?? 0) + '%' },
              ],
              tableaux: [{
                titre: 'Statistiques globales',
                colonnes: ['Indicateur', 'Valeur'],
                lignes: [
                  ['Étudiants sur la plateforme', stats?.totalEtudiantsPlateform ?? 0],
                  ['Étudiants supervisés par vous', stats?.totalEtudiants ?? 0],
                  ['Supervisions actives', stats?.etudiantsActifs ?? 0],
                  ['Total candidatures (plateforme)', stats?.totalCandidaturesPlateform ?? 0],
                  ['Candidatures en cours', stats?.enCoursPlateform ?? 0],
                  ['Candidatures acceptées', stats?.accepteesPlateform ?? 0],
                  ['Taux d\'insertion plateforme', (stats?.tauxInsertionPlateform ?? 0) + '%'],
                ]
              }]
            });
            doc.save(`rapport-insertion-${new Date().toISOString().slice(0,10)}.pdf`);
          }} />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* ── Statistiques globales de la plateforme ── */}
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                📊 Vue globale — Plateforme UNCHK
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-gray-800">{stats?.totalEtudiantsPlateform ?? 0}</p>
                <p className="text-gray-500 text-sm mt-1">Étudiants inscrits</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-purple-600">{stats?.totalCandidaturesPlateform ?? 0}</p>
                <p className="text-gray-500 text-sm mt-1">Total candidatures</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-600">{stats?.accepteesPlateform ?? 0}</p>
                <p className="text-gray-500 text-sm mt-1">Candidatures acceptées</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-end gap-1">
                  <p className="text-3xl font-bold text-green-700">{stats?.tauxInsertionPlateform ?? 0}%</p>
                </div>
                <p className="text-gray-500 text-sm mt-1">Taux d'insertion global</p>
                <p className="text-gray-400 text-xs mt-0.5">CDI + CDD + Stage / total</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${stats?.tauxInsertionPlateform ?? 0}%` }} />
                </div>
              </div>
            </div>

            {/* ── Boutons statuts étudiants ── */}
            {stats?.totalEtudiantsPlateform > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Statut actuel des étudiants</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{stats.totalEtudiantsPlateform} étudiant{stats.totalEtudiantsPlateform > 1 ? 's' : ''} inscrits sur la plateforme</p>
                  </div>
                  <Link to="/superviseur/etudiants"
                    className="text-xs text-green-600 hover:underline font-medium">
                    Voir tous les étudiants →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(SITUATION_LABELS).map(([key, label]) => {
                    const count = stats?.parSituationPlateform?.[key] ?? 0;
                    const pct   = stats.totalEtudiantsPlateform > 0
                      ? Math.round(count / stats.totalEtudiantsPlateform * 100)
                      : 0;
                    const colorMap: Record<string, { bg: string; border: string; ring: string; bar: string }> = {
                      en_cours_etude:    { bg: 'bg-blue-50',   border: 'border-blue-200',   ring: 'hover:ring-blue-400',   bar: 'bg-blue-500' },
                      sous_contrat_stage:{ bg: 'bg-purple-50', border: 'border-purple-200', ring: 'hover:ring-purple-400', bar: 'bg-purple-500' },
                      sous_contrat_cdd:  { bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'hover:ring-yellow-400', bar: 'bg-yellow-500' },
                      sous_contrat_cdi:  { bg: 'bg-green-50',  border: 'border-green-200',  ring: 'hover:ring-green-400',  bar: 'bg-green-500' },
                      chomeur:           { bg: 'bg-red-50',    border: 'border-red-200',    ring: 'hover:ring-red-400',    bar: 'bg-red-500' },
                    };
                    const c = colorMap[key];
                    return (
                      <Link
                        key={key}
                        to={`/superviseur/etudiants?situation=${key}`}
                        className={`flex flex-col p-4 rounded-xl border-2 ${c.bg} ${c.border} ${c.ring} hover:ring-2 transition-all cursor-pointer group`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-2xl font-bold ${SITUATION_BG[key].split(' ')[1]}`}>{count}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SITUATION_BG[key]}`}>{pct}%</span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
                        <div className="w-full bg-white bg-opacity-60 rounded-full h-1.5 mt-2">
                          <div className={`h-1.5 rounded-full transition-all duration-500 ${c.bar}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Mes supervisions ── */}
            <div className="mb-2 mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                👥 Mes supervisions
              </h3>
            </div>
            {stats?.totalEtudiants === 0 ? (
              <div className="mb-6 rounded-2xl overflow-hidden border border-purple-100 shadow-sm">
                <div className="bg-gradient-to-r from-purple-600 to-purple-400 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎓</span>
                    <div>
                      <p className="text-white font-bold text-lg">Aucun étudiant supervisé</p>
                      <p className="text-purple-100 text-sm">Commencez à suivre vos premiers étudiants</p>
                    </div>
                  </div>
                  <Link to="/superviseur/etudiants"
                    className="flex items-center gap-2 bg-white text-purple-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-purple-50 transition shadow">
                    Voir les étudiants →
                  </Link>
                </div>
                <div className="bg-white px-6 py-4 grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
                    <span className="text-2xl">👁️</span>
                    <div>
                      <p className="text-xs text-gray-500">À superviser</p>
                      <p className="font-bold text-gray-800">{stats?.totalEtudiantsInscrits ?? 0} étudiants</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="text-xs text-gray-500">Candidatures total</p>
                      <p className="font-bold text-gray-800">{stats?.totalCandidaturesInscrits ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-xs text-gray-500">Taux insertion global</p>
                      <p className="font-bold text-green-700">{stats?.tauxInsertionGlobal ?? 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-3xl font-bold text-gray-800">{stats.totalEtudiants}</p>
                  <p className="text-gray-500 text-sm mt-1">Étudiants supervisés</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.etudiantsActifs} actifs</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-3xl font-bold text-purple-600">{stats.totalCandidatures}</p>
                  <p className="text-gray-500 text-sm mt-1">Leurs candidatures</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-3xl font-bold text-green-600">{stats.candidaturesAcceptees}</p>
                  <p className="text-gray-500 text-sm mt-1">Acceptées</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-3xl font-bold text-green-700">{stats.tauxInsertion}%</p>
                  <p className="text-gray-500 text-sm mt-1">Taux d'insertion</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-green-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${stats.tauxInsertion}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Graphiques candidatures plateforme ── */}
            {(stats?.totalCandidaturesPlateform ?? 0) > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">Répartition des candidatures</h3>
                  <p className="text-xs text-gray-400 mb-4">Ensemble de la plateforme</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieCandidatures} cx="50%" cy="50%" outerRadius={80}
                        dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {pieCandidatures.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">Taux d'insertion global</h3>
                  <p className="text-xs text-gray-400 mb-4">Basé sur les candidatures acceptées / étudiants inscrits</p>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative">
                      <ResponsiveContainer width={200} height={200}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                          data={radialDataPlateform} startAngle={90} endAngle={90 - (3.6 * (stats?.tauxInsertionPlateform || 0))}>
                          <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" background={{ fill: '#F3F4F6' }} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-green-600">{stats?.tauxInsertionPlateform}%</span>
                        <span className="text-xs text-gray-500 mt-1">insertion</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">{stats?.accepteesPlateform} acceptée{(stats?.accepteesPlateform ?? 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <span className="text-gray-600">{stats?.totalEtudiantsPlateform} étudiant{(stats?.totalEtudiantsPlateform ?? 0) > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Répartition par statut (si supervisés) ── */}
            {pieSituation.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-1">Statut actuel de mes étudiants supervisés</h3>
                <p className="text-xs text-gray-400 mb-4">{stats?.totalEtudiants} étudiants supervisés</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieSituation} cx="50%" cy="50%" outerRadius={80}
                        dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {pieSituation.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center gap-3">
                    {Object.entries(SITUATION_LABELS).map(([key, label]) => {
                      const count = stats?.parSituationActuelle?.[key] || 0;
                      const pct = (stats?.totalEtudiants ?? 0) > 0 ? Math.round(count / stats.totalEtudiants * 100) : 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SITUATION_BG[key]}`}>{label}</span>
                            <span className="text-gray-600 font-semibold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: SITUATION_COLORS_HEX[key] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Activité récente ── */}
            {stats?.recentes?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">🕐 Activité récente — Dernières candidatures</h3>
                <div className="space-y-3">
                  {stats.recentes.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {c.etudiant.prenom} {c.etudiant.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.offre.titre} — {c.offre.entreprise.nomEntreprise}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(c.dateCandidature).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statutColors[c.statut] || 'bg-gray-100 text-gray-600'}`}>
                        {statutLabels[c.statut] || c.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Navigation rapide ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/superviseur/etudiants"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-800 mb-1">Mes étudiants</h3>
                <p className="text-gray-500 text-sm">Suivez le parcours d'insertion de vos étudiants</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {stats?.totalEtudiantsPlateform ?? 0} sur la plateforme
                  </span>
                  {(stats?.totalEtudiants ?? 0) > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {stats.totalEtudiants} supervisé{stats.totalEtudiants > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </Link>
              <Link to="/offres"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-800 mb-1">Offres disponibles</h3>
                <p className="text-gray-500 text-sm">Consultez les offres de stage et d'emploi</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}