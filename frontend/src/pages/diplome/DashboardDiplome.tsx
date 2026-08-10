import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import BadgeMessages from '../../components/BadgeMessages';
import Notifications from '../../components/Notifications';

const SITUATION_LABELS: Record<string, string> = {
  sous_contrat_cdi:      'Emploi CDI',
  sous_contrat_cdd:      'Emploi CDD',
  sous_contrat_stage:    'Stage professionnel',
  freelance:             'Freelance / Indépendant',
  entrepreneur:          "Entrepreneur",
  en_formation_continue: "En formation continue",
  en_recherche_emploi:   "En recherche d'emploi",
  expatrie:              "En emploi à l'étranger",
  sans_activite:         'Sans activité déclarée',
};

const SITUATION_COLORS: Record<string, string> = {
  sous_contrat_cdi:      'bg-green-100 text-green-700',
  sous_contrat_cdd:      'bg-yellow-100 text-yellow-700',
  sous_contrat_stage:    'bg-indigo-100 text-indigo-700',
  freelance:             'bg-cyan-100 text-cyan-700',
  entrepreneur:          'bg-orange-100 text-orange-700',
  en_formation_continue: 'bg-teal-100 text-teal-700',
  en_recherche_emploi:   'bg-red-100 text-red-700',
  expatrie:              'bg-pink-100 text-pink-700',
  sans_activite:         'bg-gray-100 text-gray-700',
};

export default function DashboardDiplome() {
  const [profil, setProfil] = useState<any>(null);
  const [statuts, setStatuts] = useState<any[]>([]);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [offres, setOffres] = useState<any[]>([]);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([
      api.get('/profil'),
      api.get('/statut-professionnel'),
      api.get('/candidatures/mes-candidatures'),
      api.get('/offres?page=1'),
    ]).then(([p, s, c, o]) => {
      setProfil(p.data?.data);
      setStatuts(s.data?.data || []);
      setCandidatures(c.data?.data || []);
      setOffres((o.data?.data?.offres || [])
        .filter((x: any) => ['cdi','cdd','freelance','alternance'].includes(x.typeOffre))
        .slice(0, 4));
    }).catch(() => {});
  }, []);

  const situationActuelle = profil?.situationActuelle;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/diplome/dashboard', label: 'Accueil', icon: 'fa-solid fa-house' },
              { to: '/offres', label: 'Offres emploi', icon: 'fa-solid fa-briefcase' },
              { to: '/candidatures', label: 'Candidatures', icon: 'fa-solid fa-file-lines' },
              { to: '/statut-professionnel', label: 'Mon statut', icon: 'fa-solid fa-chart-bar' },
              { to: '/competences', label: 'Compétences', icon: 'fa-solid fa-star' },
              { to: '/profil', label: 'Profil', icon: 'fa-solid fa-user' },
              { to: '/messagerie', label: 'Messages', icon: 'fa-solid fa-comments' },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-150 flex items-center gap-1">
                {icon && <i className={icon}></i>} {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <BadgeMessages />
            <Notifications />
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <Link to="/profil" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.[0]?.toUpperCase() || 'D'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-gray-800">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-purple-600">Diplômé UNCHK</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <i className="fa-solid fa-user-graduate mr-2 text-purple-600"></i>
            Espace Diplômé UNCHK
          </h1>
          <p className="text-gray-500 mt-1">Suivez votre insertion professionnelle post-diplôme</p>
        </div>

        {/* Situation actuelle */}
        <div className={`rounded-xl p-5 mb-6 border-2 ${situationActuelle ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                <i className="fa-solid fa-circle-info mr-1"></i>
                Votre situation professionnelle actuelle
              </p>
              {situationActuelle ? (
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${SITUATION_COLORS[situationActuelle] || 'bg-gray-100 text-gray-700'}`}>
                  {SITUATION_LABELS[situationActuelle] || situationActuelle}
                </span>
              ) : (
                <p className="text-orange-700 font-semibold">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                  Situation non déclarée — Veuillez mettre à jour votre profil
                </p>
              )}
            </div>
            <Link to="/statut-professionnel"
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
              <i className="fa-solid fa-pen"></i>
              {situationActuelle ? 'Mettre à jour' : 'Déclarer ma situation'}
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Candidatures', value: candidatures.length, icon: 'fa-solid fa-file-lines', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'En cours', value: candidatures.filter((c: any) => ['soumise','vue','entretien'].includes(c.statut)).length, icon: 'fa-solid fa-hourglass-half', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Acceptées', value: candidatures.filter((c: any) => c.statut === 'acceptee').length, icon: 'fa-solid fa-circle-check', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Statuts déclarés', value: statuts.length, icon: 'fa-solid fa-chart-bar', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
                <i className={`${kpi.icon} ${kpi.color} text-lg`}></i>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Raccourcis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/statut-professionnel', icon: 'fa-solid fa-chart-bar', title: 'Déclarer mon statut', desc: 'Mettez à jour votre situation professionnelle post-diplôme', color: 'border-purple-200 hover:border-purple-400' },
            { to: '/offres', icon: 'fa-solid fa-briefcase', title: 'Chercher un emploi', desc: 'Consultez les offres CDI, CDD, Freelance et Alternance', color: 'border-green-200 hover:border-green-400' },
            { to: '/profil', icon: 'fa-solid fa-user', title: 'Mon profil', desc: 'Complétez votre profil pour vous démarquer auprès des recruteurs', color: 'border-blue-200 hover:border-blue-400' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`bg-white rounded-xl border-2 ${item.color} p-5 hover:shadow-md transition block`}>
              <i className={`${item.icon} text-2xl mb-3 text-gray-600`}></i>
              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Offres emploi récentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              <i className="fa-solid fa-briefcase mr-2 text-green-600"></i>
              Offres d'emploi récentes (CDI / CDD / Freelance)
            </h2>
            <Link to="/offres" className="text-green-600 text-sm hover:underline">Voir toutes →</Link>
          </div>
          {offres.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune offre d'emploi disponible</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offres.map((offre: any) => (
                <Link key={offre.id} to={`/offres/${offre.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{offre.titre}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{offre.typeOffre}</span>
                  </div>
                  <p className="text-gray-500 text-xs">{offre.entreprise?.nomEntreprise} • {offre.localisation}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
