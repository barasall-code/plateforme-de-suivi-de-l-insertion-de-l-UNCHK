import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function RechercheProfiles() {
  const [profils, setProfils] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtres, setFiltres] = useState({ filiere: '', niveau: '', competence: '', disponible: '' });
  const [total, setTotal] = useState(0);

  const chercher = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtres.filiere) params.append('filiere', filtres.filiere);
      if (filtres.niveau) params.append('niveau', filtres.niveau);
      if (filtres.competence) params.append('competence', filtres.competence);
      const r = await api.get('/entreprise/profils-candidats?' + params.toString());
      setProfils(r.data?.data?.profils || []);
      setTotal(r.data?.data?.total || 0);
    } catch { setProfils([]); }
    setLoading(false);
  };

  useEffect(() => { chercher(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            {[
              { to: '/entreprise/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
              { to: '/entreprise/offres', label: 'Mes offres', icon: 'fa-solid fa-briefcase' },
              { to: '/entreprise/candidatures', label: 'Candidatures', icon: 'fa-solid fa-file-lines' },
              { to: '/entreprise/profils', label: 'Rechercher profils', icon: 'fa-solid fa-magnifying-glass' },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition flex items-center gap-1">
                <i className={icon}></i> {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <i className="fa-solid fa-magnifying-glass mr-2 text-blue-600"></i>
            Recherche de profils UNCHK
          </h1>
          <p className="text-gray-500 mt-1">Trouvez les candidats qualifiés parmi les étudiants et diplômés de l'UNCHK</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4"><i className="fa-solid fa-sliders mr-2 text-blue-600"></i>Critères de recherche</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filière</label>
              <input type="text" placeholder="Ex: Informatique" value={filtres.filiere}
                onChange={e => setFiltres({...filtres, filiere: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Niveau</label>
              <select value={filtres.niveau} onChange={e => setFiltres({...filtres, niveau: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Tous niveaux</option>
                <option value="licence">Licence</option>
                <option value="master1">Master 1</option>
                <option value="master2">Master 2</option>
                <option value="doctorat">Doctorat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Compétence</label>
              <input type="text" placeholder="Ex: React, Python..." value={filtres.competence}
                onChange={e => setFiltres({...filtres, competence: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="flex items-end">
              <button onClick={chercher} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500"><span className="font-semibold text-gray-800">{total}</span> profil(s) trouvé(s)</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Recherche en cours...</p>
          </div>
        ) : profils.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <i className="fa-solid fa-users-slash text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">Aucun profil trouvé avec ces critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profils.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {p.prenom?.[0]}{p.nom?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{p.prenom} {p.nom}</p>
                    <p className="text-xs text-gray-500">{p.filiere} — {p.niveauEtude}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {p.competences?.slice(0,3).map((c: any) => (
                    <span key={c.id} className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-1">{c.competence?.nom}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.utilisateur?.typeUtilisateur === 'diplome' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.utilisateur?.typeUtilisateur === 'diplome' ? 'Diplômé' : 'Étudiant'}
                  </span>
                  <Link to={`/entreprise/candidat/${p.utilisateur?.id}`}
                    className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg transition font-medium">
                    Voir profil →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
