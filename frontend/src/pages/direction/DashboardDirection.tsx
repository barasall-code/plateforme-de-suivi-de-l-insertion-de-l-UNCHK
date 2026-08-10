import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { exportRapportInstitutionnel } from '../../utils/exportStats';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#78716c'];

export default function DashboardDirection() {
  const [stats, setStats] = useState<any>(null);
  const [avancees, setAvancees] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/stats/avancees'),
    ]).then(([s, a]) => {
      setStats(s.data?.data);
      setAvancees(a.data?.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-green-600 mb-4"></i>
        <p className="text-gray-500">Chargement des indicateurs...</p>
      </div>
    </div>
  );

  // Calculs indicateurs clés
  const totalDiplomes = stats?.totalEtudiants || 0;
  const tauxInsertion = stats?.tauxInsertion || 0;
  const diplomeEnEmploi = Math.round(totalDiplomes * tauxInsertion / 100);
  const offresPubliees = stats?.offresPubliees || 0;
  const totalCandidatures = stats?.totalCandidatures || 0;
  const candidaturesAcceptees = stats?.candidaturesAcceptees || 0;
  const tauxAcceptation = totalCandidatures > 0 ? Math.round(candidaturesAcceptees / totalCandidatures * 100) : 0;

  // Données pour graphiques
  const statutsData = avancees?.parStatutCandidature || [];
  const candidaturesParMois = (avancees?.candidaturesParMois || []).map((m: any) => ({
    mois: 'Mois ' + m.mois,
    nombre: m.nombre
  }));
  const filiereData = (avancees?.parFiliere || []).filter((f: any) => f.filiere);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-gray-800">Plateforme d'insertion</p>
              <p className="text-xs text-green-600">Direction — Pilotage stratégique</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              <i className="fa-solid fa-shield-halved mr-1"></i>Direction UNCHK
            </span>
            <Link to="/admin/dashboard" className="text-xs text-gray-500 hover:text-gray-700">
              <i className="fa-solid fa-arrow-left mr-1"></i>Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* En-tête */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <i className="fa-solid fa-chart-pie mr-2 text-green-600"></i>
              Tableau de bord — Pilotage stratégique
            </h1>
            <p className="text-gray-500 mt-1">
              Université Numérique Cheikh Hamidou Kane — Insertion professionnelle {new Date().getFullYear()}
            </p>
          </div>
          <button
            onClick={() => exportRapportInstitutionnel(stats, avancees)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <i className="fa-solid fa-file-csv"></i>
            Exporter CSV
          </button>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Taux d'insertion", value: tauxInsertion + '%', icon: 'fa-solid fa-arrow-trend-up', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', desc: 'Diplômés en emploi' },
            { label: 'Diplômés insérés', value: diplomeEnEmploi, icon: 'fa-solid fa-user-check', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Sur ' + totalDiplomes + ' diplômés' },
            { label: 'Offres publiées', value: offresPubliees, icon: 'fa-solid fa-briefcase', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Offres actives' },
            { label: 'Taux acceptation', value: tauxAcceptation + '%', icon: 'fa-solid fa-circle-check', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', desc: candidaturesAcceptees + ' / ' + totalCandidatures + ' candidatures' },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.bg} border ${kpi.border} rounded-xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <i className={`${kpi.icon} ${kpi.color} text-xl`}></i>
              </div>
              <p className={`text-3xl font-bold ${kpi.color} mb-1`}>{kpi.value}</p>
              <p className="text-xs text-gray-400">{kpi.desc}</p>
            </div>
          ))}
        </div>

        {/* Ligne 2 : KPIs secondaires */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Étudiants actifs', value: stats?.totalEtudiants || 0, icon: 'fa-solid fa-graduation-cap', color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Entreprises partenaires', value: stats?.totalEntreprises || 0, icon: 'fa-solid fa-building', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Total candidatures', value: totalCandidatures, icon: 'fa-solid fa-file-lines', color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'En attente validation', value: stats?.entreprisesEnAttente || 0, icon: 'fa-solid fa-hourglass-half', color: 'text-yellow-600', bg: 'bg-yellow-50' },
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

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Répartition des statuts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-chart-pie mr-2 text-green-600"></i>
              Répartition des situations professionnelles
            </h3>
            {statutsData.length > 0 ? (
              <div className="space-y-3 mt-2">
                {statutsData.map((s: any, i: number) => {
                  const total = statutsData.reduce((acc: number, x: any) => acc + x.nombre, 0);
                  const pct = total > 0 ? Math.round(s.nombre / total * 100) : 0;
                  const labels: Record<string, string> = {
                    acceptee: 'Acceptée', entretien: 'Entretien', soumise: 'Soumise',
                    vue: 'Vue', refusee: 'Refusée'
                  };
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{labels[s.statut] || s.statut}</span>
                        <span className="font-bold text-gray-900">{s.nombre} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-4">
                        <div className="h-4 rounded-full transition-all" style={{width: pct + '%', backgroundColor: COLORS[i % COLORS.length]}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <i className="fa-solid fa-chart-pie text-4xl mb-2 opacity-30"></i>
                  <p className="text-sm">Aucune candidature traitée</p>
                </div>
              </div>
            )}
          </div>

          {/* Évolution candidatures */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-calendar mr-2 text-blue-600"></i>
              Évolution des candidatures ({new Date().getFullYear()})
            </h3>
            {candidaturesParMois.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={candidaturesParMois}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="nombre" stroke="#16a34a" strokeWidth={2} dot={{r: 4}} name="Candidatures" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Données insuffisantes</p>
              </div>
            )}
          </div>

          {/* Adéquation formation-emploi par filière */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-flask mr-2 text-orange-600"></i>
              Adéquation formation-emploi par filière
            </h3>
            {filiereData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={filiereData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{fontSize: 11}} />
                  <YAxis dataKey="filiere" type="category" tick={{fontSize: 10}} width={80} />
                  <Tooltip />
                  <Bar dataKey="nombre" fill="#16a34a" name="Étudiants" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Données insuffisantes</p>
              </div>
            )}
          </div>

          {/* Entonnoir candidatures */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              <i className="fa-solid fa-filter mr-2 text-purple-600"></i>
              Entonnoir de recrutement
            </h3>
            <div className="space-y-3 mt-6">
              {[
                { label: 'Candidatures soumises', value: totalCandidatures, color: 'bg-blue-500', pct: 100 },
                { label: 'Candidatures vues', value: (avancees?.parStatutCandidature || []).find((s: any) => s.statut === 'vue')?.nombre || 0 || 0, color: 'bg-indigo-500', pct: totalCandidatures > 0 ? Math.round(((avancees?.parStatutCandidature || []).find((s: any) => s.statut === 'vue')?.nombre || 0 || 0) / totalCandidatures * 100) : 0 },
                { label: 'Entretiens', value: (avancees?.parStatutCandidature || []).find((s: any) => s.statut === 'entretien')?.nombre || 0 || 0, color: 'bg-orange-500', pct: totalCandidatures > 0 ? Math.round(((avancees?.parStatutCandidature || []).find((s: any) => s.statut === 'entretien')?.nombre || 0 || 0) / totalCandidatures * 100) : 0 },
                { label: 'Acceptées', value: candidaturesAcceptees, color: 'bg-green-500', pct: tauxAcceptation },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.value} ({item.pct}%)</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full transition-all`} style={{width: item.pct + '%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rapport institutionnel */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">
                <i className="fa-solid fa-file-contract mr-2"></i>
                Rapport institutionnel UNCHK {new Date().getFullYear()}
              </h3>
              <p className="text-green-200 text-sm">
                Synthèse de l'insertion professionnelle des diplômés — destiné aux tutelles et partenaires
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/dashboard"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
                <i className="fa-solid fa-chart-bar"></i>
                Dashboard admin
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-white text-green-700 hover:bg-green-50 text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
                <i className="fa-solid fa-print"></i>
                Imprimer / PDF
              </button>
            </div>
          </div>
          {/* Résumé synthétique */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Taux d'insertion", value: tauxInsertion + '%' },
              { label: 'Diplômés suivis', value: totalDiplomes },
              { label: 'Entreprises actives', value: stats?.totalEntreprises || 0 },
              { label: 'Offres traitées', value: stats?.totalOffres || 0 },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-green-200 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
