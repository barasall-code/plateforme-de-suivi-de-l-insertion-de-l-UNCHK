import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function MarqueEmployeur() {
  const [profil, setProfil] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/profil'),
      api.get('/entreprise/stats'),
    ]).then(([p, s]) => {
      setProfil(p.data?.data);
      setStats(s.data?.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-blue-600"></i></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2"><img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-2">
            {[
              { to: '/entreprise/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
              { to: '/entreprise/offres', label: 'Mes offres', icon: 'fa-solid fa-briefcase' },
              { to: '/entreprise/marque', label: 'Marque employeur', icon: 'fa-solid fa-building' },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition flex items-center gap-1">
                <i className={icon}></i> {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <i className="fa-solid fa-building mr-2 text-blue-600"></i>
            Votre marque employeur sur UNCHK
          </h1>
          <p className="text-gray-500 mt-1">Comment les étudiants et diplômés voient votre entreprise</p>
        </div>

        {/* Carte de présentation publique */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              <i className="fa-solid fa-building"></i>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{profil?.nomEntreprise || 'Votre entreprise'}</h2>
              <p className="text-blue-200 mb-2"><i className="fa-solid fa-industry mr-1"></i>{profil?.secteurActivite || 'Secteur non renseigné'}</p>
              <p className="text-blue-200"><i className="fa-solid fa-location-dot mr-1"></i>{profil?.ville || 'Ville non renseignée'}</p>
              {profil?.siteWeb && (
                <a href={profil.siteWeb} target="_blank" rel="noopener noreferrer"
                  className="text-white underline text-sm mt-1 inline-block">
                  <i className="fa-solid fa-globe mr-1"></i>{profil.siteWeb}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* KPIs visibilité */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Offres publiées', value: stats?.totalOffres ?? 0, icon: 'fa-solid fa-briefcase', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Candidatures reçues', value: stats?.totalCandidatures ?? 0, icon: 'fa-solid fa-file-lines', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Profils consultés', value: stats?.profilsConsultes ?? 0, icon: 'fa-solid fa-eye', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Recrutements', value: stats?.recrutements ?? 0, icon: 'fa-solid fa-user-check', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <i className={`${kpi.icon} ${kpi.color}`}></i>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Conseils marque employeur */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            <i className="fa-solid fa-lightbulb mr-2 text-yellow-500"></i>
            Renforcez votre marque employeur
          </h3>
          <div className="space-y-3">
            {[
              { done: !!profil?.nomEntreprise, label: 'Nom d\'entreprise renseigné', action: '/entreprise/profil' },
              { done: !!profil?.secteurActivite, label: 'Secteur d\'activité renseigné', action: '/entreprise/profil' },
              { done: !!profil?.siteWeb, label: 'Site web renseigné', action: '/entreprise/profil' },
              { done: !!profil?.ville, label: 'Ville renseignée', action: '/entreprise/profil' },
              { done: (stats?.totalOffres ?? 0) > 0, label: 'Au moins une offre publiée', action: '/entreprise/offres/nouvelle' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                    <i className={item.done ? 'fa-solid fa-check' : 'fa-solid fa-xmark'}></i>
                  </span>
                  <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>{item.label}</span>
                </div>
                {!item.done && (
                  <Link to={item.action} className="text-xs text-blue-600 hover:underline">Compléter →</Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lien vers recherche profils */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-800"><i className="fa-solid fa-magnifying-glass mr-2"></i>Recherchez des talents</p>
            <p className="text-blue-600 text-sm mt-1">Consultez les profils des étudiants et diplômés UNCHK qualifiés</p>
          </div>
          <Link to="/entreprise/profils"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Rechercher →
          </Link>
        </div>
      </main>
    </div>
  );
}
