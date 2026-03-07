import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Notifications from '../../components/Notifications';
import api from '../../services/api';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';

export default function DashboardSuperviseur() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const response = await api.get('/superviseur/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pieCandidatures = stats ? [
    { name: 'Acceptées', value: stats.candidaturesAcceptees, color: '#10B981' },
    { name: 'En cours', value: stats.candidaturesEnCours, color: '#F59E0B' },
    { name: 'Autres', value: Math.max(0, stats.totalCandidatures - stats.candidaturesAcceptees - stats.candidaturesEnCours), color: '#E5E7EB' },
  ].filter(d => d.value > 0) : [];

  const radialData = stats ? [
    { name: 'Taux d\'insertion', value: stats.tauxInsertion, fill: '#10B981' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-green-700">UNCHK — Superviseur</Link>
          <div className="flex items-center gap-4">
            <Link to="/superviseur/etudiants" className="text-sm text-gray-600 hover:text-green-700 font-medium">
              Mes étudiants
            </Link>
            <Link to="/offres" className="text-sm text-gray-600 hover:text-green-700 font-medium">
              Offres
            </Link>
            <Notifications />
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
              superviseur
            </span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
   <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h2>
            <p className="text-gray-500">Suivi de l'insertion professionnelle de vos étudiants</p>
          </div>
          <BoutonExport label="Exporter rapport" onClick={() => {
            const doc = genererPDF({
              titre: 'Rapport d\'Insertion Professionnelle',
              sousTitre: `Superviseur : ${user?.email}`,
              stats: [
                { label: 'Étudiants suivis', valeur: stats?.totalEtudiants ?? 0 },
                { label: 'Actifs', valeur: stats?.etudiantsActifs ?? 0 },
                { label: 'Candidatures', valeur: stats?.totalCandidatures ?? 0 },
                { label: 'En cours', valeur: stats?.candidaturesEnCours ?? 0 },
                { label: 'Acceptées', valeur: stats?.candidaturesAcceptees ?? 0 },
                { label: 'Taux insertion', valeur: (stats?.tauxInsertion ?? 0) + '%' },
              ],
              tableaux: [{
                titre: 'Statistiques d\'insertion',
                colonnes: ['Indicateur', 'Valeur'],
                lignes: [
                  ['Étudiants suivis', stats?.totalEtudiants ?? 0],
                  ['Étudiants actifs', stats?.etudiantsActifs ?? 0],
                  ['Total candidatures', stats?.totalCandidatures ?? 0],
                  ['Candidatures en cours', stats?.candidaturesEnCours ?? 0],
                  ['Candidatures acceptées', stats?.candidaturesAcceptees ?? 0],
                  ['Taux d\'insertion', (stats?.tauxInsertion ?? 0) + '%'],
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
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-gray-800">{stats?.totalEtudiants}</p>
                <p className="text-gray-500 text-sm mt-1">Étudiants suivis</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-blue-600">{stats?.etudiantsActifs}</p>
                <p className="text-gray-500 text-sm mt-1">Supervisions actives</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-purple-600">{stats?.totalCandidatures}</p>
                <p className="text-gray-500 text-sm mt-1">Total candidatures</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-yellow-500">{stats?.candidaturesEnCours}</p>
                <p className="text-gray-500 text-sm mt-1">En cours</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-600">{stats?.candidaturesAcceptees}</p>
                <p className="text-gray-500 text-sm mt-1">Acceptées</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-700">{stats?.tauxInsertion}%</p>
                <p className="text-gray-500 text-sm mt-1">Taux d'insertion</p>
              </div>
            </div>

            {/* Graphiques */}
            {stats?.totalCandidatures > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pie candidatures */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Répartition des candidatures</h3>
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

                {/* Taux d'insertion radial */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Taux d'insertion</h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative">
                      <ResponsiveContainer width={200} height={200}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                          data={radialData} startAngle={90} endAngle={90 - (3.6 * (stats?.tauxInsertion || 0))}>
                          <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" background={{ fill: '#F3F4F6' }} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-green-600">{stats?.tauxInsertion}%</span>
                        <span className="text-xs text-gray-500 mt-1">insertion</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">{stats?.candidaturesAcceptees} acceptée{stats?.candidaturesAcceptees > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <span className="text-gray-600">{stats?.totalEtudiants} étudiant{stats?.totalEtudiants > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation rapide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/superviseur/etudiants"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-800 mb-1">Mes étudiants</h3>
                <p className="text-gray-500 text-sm">Suivez le parcours d'insertion de vos étudiants</p>
                <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {stats?.totalEtudiants} étudiant{stats?.totalEtudiants > 1 ? 's' : ''}
                </span>
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