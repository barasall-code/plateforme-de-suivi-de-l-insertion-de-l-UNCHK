import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function GestionRelances() {
  const [nonRepondants, setNonRepondants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relancing, setRelancing] = useState(false);
  const [message, setMessage] = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/diplomes/non-repondants');
      setNonRepondants(r.data?.data || []);
    } catch { setNonRepondants([]); }
    setLoading(false);
  };

  useEffect(() => { charger(); }, []);

  const relancerTous = async () => {
    setRelancing(true);
    try {
      const r = await api.post('/admin/diplomes/relancer');
      setMessage('✅ ' + (r.data?.message || 'Relances envoyées'));
      setTimeout(() => setMessage(''), 4000);
    } catch (e: any) {
      setMessage('❌ ' + e.message);
    }
    setRelancing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" /></Link>
          </div>
          <h1 className="font-bold text-gray-800">
            <i className="fa-solid fa-bell mr-2 text-orange-500"></i>
            Gestion des relances — Diplômés
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/admin/utilisateurs" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <i className="fa-solid fa-users"></i> Utilisateurs
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* En-tête + actions */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Diplômés sans déclaration récente
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Diplômés n'ayant pas mis à jour leur situation professionnelle depuis plus de 12 mois
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={charger}
              className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition">
              <i className="fa-solid fa-rotate-right"></i> Actualiser
            </button>
            <button onClick={relancerTous} disabled={relancing || nonRepondants.length === 0}
              className="flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-medium">
              {relancing
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Envoi...</>
                : <><i className="fa-solid fa-paper-plane"></i> Relancer tous ({nonRepondants.length})</>
              }
            </button>
          </div>
        </div>

        {/* Message de confirmation */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Non-répondants', value: nonRepondants.length, icon: 'fa-solid fa-user-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Sans aucune déclaration', value: nonRepondants.filter(u => u.etudiant?._count?.statutsProfessionnels === 0).length, icon: 'fa-solid fa-circle-xmark', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Avec déclarations anciennes', value: nonRepondants.filter(u => (u.etudiant?._count?.statutsProfessionnels || 0) > 0).length, icon: 'fa-solid fa-clock-rotate-left', color: 'text-yellow-600', bg: 'bg-yellow-50' },
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

        {/* Liste non-répondants */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Chargement...</p>
          </div>
        ) : nonRepondants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <i className="fa-solid fa-circle-check text-5xl text-green-400 mb-3"></i>
            <p className="font-semibold text-gray-700">Tous les diplômés ont déclaré leur situation !</p>
            <p className="text-gray-400 text-sm mt-1">Aucune relance nécessaire</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Diplômé</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Filière</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Niveau</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Promotion</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Déclarations</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {nonRepondants.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">
                          {u.etudiant?.prenom?.[0]}{u.etudiant?.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{u.etudiant?.prenom} {u.etudiant?.nom}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.etudiant?.filiere || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.etudiant?.niveauEtude || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.etudiant?.promotion || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${(u.etudiant?._count?.statutsProfessionnels || 0) === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.etudiant?._count?.statutsProfessionnels || 0} déclaration(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(u.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info CRON */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Relance automatique annuelle</p>
            <p>Le système envoie automatiquement une notification à chaque diplômé non-répondant le <strong>1er janvier à 08h00</strong> (heure de Dakar). Vous pouvez également déclencher une relance manuelle ci-dessus.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
