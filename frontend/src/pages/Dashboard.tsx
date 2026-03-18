
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from '../components/Notifications';
import api from '../services/api';
import BadgeMessages from '../components/BadgeMessages';
import BoutonExport, { genererPDF } from '../components/ExportPDF';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCandidatures: 0,
    soumises: 0,
    vues: 0,
    entretiens: 0,
    acceptees: 0,
    refusees: 0,
  });
  const [offresRecentes, setOffresRecentes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [candidaturesRes, offresRes] = await Promise.all([
        api.get('/candidatures/mes-candidatures'),
        api.get('/offres?page=1'),
      ]);
      const candidatures = candidaturesRes.data.data;
      setStats({
        totalCandidatures: candidatures.length,
        soumises: candidatures.filter((c: any) => c.statut === 'soumise').length,
        vues: candidatures.filter((c: any) => c.statut === 'vue').length,
        entretiens: candidatures.filter((c: any) => c.statut === 'entretien').length,
        acceptees: candidatures.filter((c: any) => c.statut === 'acceptee').length,
        refusees: candidatures.filter((c: any) => c.statut === 'refusee').length,
      });
      setOffresRecentes(offresRes.data.data.offres.slice(0, 3));
    } catch {
      // Erreur silencieuse — l'UI reste dans son état initial
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = [
    { name: 'Soumises', value: stats.soumises, color: '#3B82F6' },
    { name: 'Vues', value: stats.vues, color: '#F59E0B' },
    { name: 'Entretiens', value: stats.entretiens, color: '#8B5CF6' },
    { name: 'Acceptées', value: stats.acceptees, color: '#10B981' },
    { name: 'Refusées', value: stats.refusees, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const barData = [
    { statut: 'Soumises', count: stats.soumises },
    { statut: 'Vues', count: stats.vues },
    { statut: 'Entretiens', count: stats.entretiens },
    { statut: 'Acceptées', count: stats.acceptees },
    { statut: 'Refusées', count: stats.refusees },
  ];

  const getBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      stage: 'bg-blue-100 text-blue-700',
      alternance: 'bg-purple-100 text-purple-700',
      cdi: 'bg-green-100 text-green-700',
      cdd: 'bg-yellow-100 text-yellow-700',
      freelance: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>

          {/* Navigation centrale */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/offres', label: '💼 Offres' },
              { to: '/candidatures', label: '📋 Candidatures' },
              { to: '/competences', label: '⭐ Compétences' },
              { to: '/statut-professionnel', label: '📊 Mon statut' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-150">
                {label}
              </Link>
            ))}
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            <BadgeMessages />
            <Notifications />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <Link to="/profil"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition group">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden lg:block max-w-32 truncate">
                {user?.email}
              </span>
            </Link>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Bienvenue {user?.email?.split('@')[0]} 👋</h2>
            <p className="text-gray-500">Plateforme de suivi d'insertion professionnelle de l'UNCHK</p>
          </div>
          <BoutonExport label="Exporter mon rapport" onClick={() => {
            const doc = genererPDF({
              titre: 'Mon Rapport de Candidatures',
              sousTitre: `Étudiant : ${user?.email}`,
              stats: [
                { label: 'Total candidatures', valeur: stats.totalCandidatures },
                { label: 'Soumises', valeur: stats.soumises },
                { label: 'Entretiens', valeur: stats.entretiens },
                { label: 'Acceptées', valeur: stats.acceptees },
                { label: 'Refusées', valeur: stats.refusees },
              ],
              tableaux: [{
                titre: 'Récapitulatif des candidatures',
                colonnes: ['Statut', 'Nombre'],
                lignes: [
                  ['Total', stats.totalCandidatures],
                  ['Soumises', stats.soumises],
                  ['Vues', stats.vues],
                  ['Entretiens', stats.entretiens],
                  ['Acceptées', stats.acceptees],
                  ['Refusées', stats.refusees],
                ],
              
              }]
            });
            doc.save(`rapport-candidatures-${new Date().toISOString().slice(0,10)}.pdf`);
          }} />
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-gray-800">{stats.totalCandidatures}</p>
                <p className="text-gray-500 text-sm mt-1">Total candidatures</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-yellow-500">{stats.soumises + stats.vues + stats.entretiens}</p>
                <p className="text-gray-500 text-sm mt-1">En cours</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-green-600">{stats.acceptees}</p>
                <p className="text-gray-500 text-sm mt-1">Acceptées</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-3xl font-bold text-red-400">{stats.refusees}</p>
                <p className="text-gray-500 text-sm mt-1">Refusées</p>
              </div>
            </div>

            {/* Graphiques */}
            {stats.totalCandidatures > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pie chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Répartition des candidatures</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                        dataKey="value" label={({ name, value }) => `${name} (${value})`}
                        labelLine={true}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Statuts des candidatures</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="statut" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Candidatures" radius={[6, 6, 0, 0]}>
                        {barData.map((_, index) => (
                          <Cell key={index} fill={pieData[index]?.color || '#10B981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Navigation rapide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/offres" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-800 mb-1">Offres disponibles</h3>
                <p className="text-gray-500 text-sm">Consultez les offres de stage et d'emploi</p>
              </Link>
              <Link to="/candidatures" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-800 mb-1">Mes candidatures</h3>
                <p className="text-gray-500 text-sm">Suivez l'état de vos candidatures</p>
              </Link>
              <Link to="/profil" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
                <div className="text-3xl mb-3">👤</div>
                <h3 className="font-semibold text-gray-800 mb-1">Mon profil</h3>
                <p className="text-gray-500 text-sm">Gérez vos informations personnelles</p>
              </Link>
            </div>

            {/* Offres récentes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Offres récentes</h3>
                <Link to="/offres" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Voir toutes →
                </Link>
              </div>
              {offresRecentes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Aucune offre disponible</div>
              ) : (
                <div className="grid gap-4">
                  {offresRecentes.map((offre) => (
                    <Link key={offre.id} to={`/offres/${offre.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-green-300 hover:shadow-md transition block">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{offre.titre}</h4>
                          <p className="text-gray-500 text-sm">{offre.entreprise.nomEntreprise} • {offre.localisation}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getBadgeColor(offre.typeOffre)}`}>
                          {offre.typeOffre}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>📍 {offre.modeTravail}</span>
                        <span>🎓 {offre.niveauRequis}</span>
                        <span>📅 Limite : {new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}