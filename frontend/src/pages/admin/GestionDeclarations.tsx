import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const TYPE_LABELS: Record<string, string> = {
  en_emploi: 'En emploi', en_recherche: "En recherche d'emploi", en_formation: 'En formation',
};
const TYPE_COLORS: Record<string, string> = {
  en_emploi: 'bg-green-100 text-green-700', en_recherche: 'bg-yellow-100 text-yellow-700', en_formation: 'bg-blue-100 text-blue-700',
};

export default function GestionDeclarations() {
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<'toutes' | 'non_validees' | 'douteuses'>('toutes');
  const [modalSignal, setModalSignal] = useState<{id: string, nom: string} | null>(null);
  const [motif, setMotif] = useState('');
  const [message, setMessage] = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/statuts-professionnels');
      setDeclarations(r.data?.data || []);
    } catch { setDeclarations([]); }
    setLoading(false);
  };

  useEffect(() => { charger(); }, []);

  const valider = async (id: string) => {
    try {
      await api.put('/admin/statuts/' + id + '/valider');
      setDeclarations(prev => prev.map(d => d.id === id ? {...d, estValide: true} : d));
      setMessage('✅ Déclaration validée');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) { setMessage('❌ ' + e.message); }
  };

  const signaler = async () => {
    if (!modalSignal) return;
    try {
      await api.put('/admin/statuts/' + modalSignal.id + '/signaler', { motif });
      setDeclarations(prev => prev.map(d => d.id === modalSignal.id ? {...d, estValide: false} : d));
      setMessage('⚠️ Déclaration signalée comme douteuse');
      setModalSignal(null);
      setMotif('');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) { setMessage('❌ ' + e.message); }
  };

  const filtered = declarations.filter(d => {
    if (filtre === 'non_validees') return !d.estValide;
    if (filtre === 'douteuses') return d.estValide === false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-9 w-auto" /></Link>
          </div>
          <h1 className="font-bold text-gray-800">
            <i className="fa-solid fa-clipboard-check mr-2 text-green-600"></i>
            Validation des déclarations professionnelles
          </h1>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
            <i className="fa-solid fa-arrow-left"></i> Retour
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total déclarations', value: declarations.length, icon: 'fa-solid fa-clipboard-list', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Validées', value: declarations.filter(d => d.estValide).length, icon: 'fa-solid fa-circle-check', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Non validées', value: declarations.filter(d => !d.estValide).length, icon: 'fa-solid fa-clock', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Douteuses', value: declarations.filter(d => d.estValide === false).length, icon: 'fa-solid fa-triangle-exclamation', color: 'text-red-600', bg: 'bg-red-50' },
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

        {/* Filtres */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'toutes', label: 'Toutes' },
            { key: 'non_validees', label: 'Non validées' },
            { key: 'douteuses', label: 'Douteuses' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filtre === f.key ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : message.startsWith('⚠️') ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <i className="fa-solid fa-circle-check text-5xl text-green-400 mb-3"></i>
            <p className="font-semibold text-gray-700">Aucune déclaration dans cette catégorie</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Diplômé</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employeur / Poste</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                          {d.etudiant?.prenom?.[0]}{d.etudiant?.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{d.etudiant?.prenom} {d.etudiant?.nom}</p>
                          <p className="text-xs text-gray-400">{d.etudiant?.filiere}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[d.typeStatut] || 'bg-gray-100 text-gray-700'}`}>
                        {TYPE_LABELS[d.typeStatut] || d.typeStatut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {d.nomEntreprise ? (
                        <div>
                          <p className="font-medium">{d.nomEntreprise}</p>
                          <p className="text-xs text-gray-400">{d.poste} {d.typeContrat ? '· ' + d.typeContrat : ''}</p>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(d.dateDeclaration).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {d.estValide
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium"><i className="fa-solid fa-check mr-1"></i>Validée</span>
                        : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium"><i className="fa-solid fa-clock mr-1"></i>En attente</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!d.estValide && (
                          <button onClick={() => valider(d.id)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1">
                            <i className="fa-solid fa-check"></i> Valider
                          </button>
                        )}
                        <button onClick={() => setModalSignal({id: d.id, nom: d.etudiant?.prenom + ' ' + d.etudiant?.nom})}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1">
                          <i className="fa-solid fa-triangle-exclamation"></i> Douteux
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal signalement */}
      {modalSignal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-800 mb-2">
              <i className="fa-solid fa-triangle-exclamation text-red-500 mr-2"></i>
              Signaler comme douteux
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Déclaration de <strong>{modalSignal.nom}</strong> sera marquée comme douteuse et le diplômé sera notifié.
            </p>
            <textarea
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder="Motif du signalement (optionnel)..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 h-24 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button onClick={() => { setModalSignal(null); setMotif(''); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition">
                Annuler
              </button>
              <button onClick={signaler}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i> Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
