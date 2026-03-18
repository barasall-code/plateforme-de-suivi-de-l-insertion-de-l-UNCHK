import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

interface Supervision {
  superviseurId: string;
  etudiantId: string;
  dateDebut?: string;
  superviseur?: { nom: string; prenom: string; departement?: string };
  etudiant?: { nom: string; prenom: string; filiere?: string; niveauEtude?: string; utilisateur?: { email: string } };
}
interface SuperviseurItem {
  id: string;
  nom: string;
  prenom: string;
  departement?: string;
}
interface EtudiantItem {
  id: string;
  nom: string;
  prenom: string;
  filiere?: string;
  niveauEtude?: string;
}

export default function GestionSupervisions() {
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [superviseurs, setSuperviseurs] = useState<SuperviseurItem[]>([]);
  const [etudiantsSans, setEtudiantsSans] = useState<EtudiantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSuperviseur, setSelectedSuperviseur] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/admin/supervisions'),
        api.get('/admin/superviseurs'),
        api.get('/admin/supervisions/etudiants-sans-supervision'),
      ]);
      setSupervisions(r1.data.data);
      setSuperviseurs(r2.data.data);
      setEtudiantsSans(r3.data.data);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuperviseur || !selectedEtudiant) return;
    setError('');
    setIsSaving(true);
    try {
      await api.post('/admin/supervisions', {
        superviseurId: selectedSuperviseur,
        etudiantId: selectedEtudiant,
      });
      setSuccess('Étudiant affecté avec succès !');
      setShowForm(false);
      setSelectedSuperviseur('');
      setSelectedEtudiant('');
      await charger();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Erreur lors de l\'affectation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSupprimer = async (superviseurId: string, etudiantId: string) => {
    if (!confirm('Retirer cet étudiant de la supervision ?')) return;
    try {
      await api.delete(`/admin/supervisions/${superviseurId}/${etudiantId}`);
      await charger();
    } catch (err) {
      alert((err as ApiError).response?.data?.message || 'Erreur');
    }
  };

  const supervisionsFiltrees = supervisions.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.etudiant?.nom?.toLowerCase().includes(q) ||
      s.etudiant?.prenom?.toLowerCase().includes(q) ||
      s.superviseur?.nom?.toLowerCase().includes(q) ||
      s.superviseur?.prenom?.toLowerCase().includes(q) ||
      s.etudiant?.utilisateur?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all">
            ← Retour
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestion des affectations</h2>
            <p className="text-gray-500 text-sm mt-1">
              {supervisions.length} affectation{supervisions.length > 1 ? 's' : ''} •{' '}
              <span className="text-yellow-600">{etudiantsSans.length} étudiant{etudiantsSans.length > 1 ? 's' : ''} sans superviseur</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/superviseurs"
              className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Gérer les superviseurs
            </Link>
            <button onClick={() => { setShowForm(!showForm); setError(''); }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              + Nouvelle affectation
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
        )}

        {/* Formulaire d'affectation */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">🔗 Affecter un étudiant à un superviseur</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleAssigner} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Superviseur *</label>
                  <select value={selectedSuperviseur} onChange={(e) => setSelectedSuperviseur(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">— Sélectionner un superviseur —</option>
                    {superviseurs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.prenom} {s.nom} {s.departement ? `(${s.departement})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Étudiant * (sans superviseur actif : {etudiantsSans.length})
                  </label>
                  <select value={selectedEtudiant} onChange={(e) => setSelectedEtudiant(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">— Sélectionner un étudiant —</option>
                    {etudiantsSans.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.prenom} {e.nom} — {e.filiere} ({e.niveauEtude})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                  {isSaving ? 'Affectation...' : 'Affecter'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recherche */}
        <div className="mb-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par étudiant, superviseur ou email..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : supervisionsFiltrees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">🔗</p>
            <p className="text-gray-500">
              {search ? 'Aucun résultat pour cette recherche.' : 'Aucune affectation de supervision enregistrée.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Filière</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Superviseur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Département</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Depuis</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {supervisionsFiltrees.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{s.etudiant?.prenom} {s.etudiant?.nom}</p>
                        <p className="text-xs text-gray-400">{s.etudiant?.utilisateur?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.etudiant?.filiere} — {s.etudiant?.niveauEtude}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {s.superviseur?.prenom} {s.superviseur?.nom}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.superviseur?.departement || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {s.dateDebut ? new Date(s.dateDebut).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleSupprimer(s.superviseurId, s.etudiantId)}
                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-lg">
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
