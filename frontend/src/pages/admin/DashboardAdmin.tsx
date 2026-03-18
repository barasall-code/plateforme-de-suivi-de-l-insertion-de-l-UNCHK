import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BoutonExport, { genererPDF } from '../../components/ExportPDF';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

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