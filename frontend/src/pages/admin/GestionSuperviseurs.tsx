import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

interface Superviseur {
  id: string;
  nom: string;
  prenom: string;
  departement?: string;
  telephone?: string;
  utilisateur?: { email: string; estActif?: boolean };
  _count?: { supervisions: number };
}

export default function GestionSuperviseurs() {
  const [superviseurs, setSuperviseurs] = useState<Superviseur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    email: '', motDePasse: '', nom: '', prenom: '', departement: '', telephone: '',
  });

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const response = await api.get('/admin/superviseurs');
      setSuperviseurs(response.data.data);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ouvrirCreation = () => {
    setForm({ email: '', motDePasse: '', nom: '', prenom: '', departement: '', telephone: '' });
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const ouvrirEdition = (s: Superviseur) => {
    setForm({
      email: s.utilisateur?.email || '',
      motDePasse: '',
      nom: s.nom || '',
      prenom: s.prenom || '',
      departement: s.departement || '',
      telephone: s.telephone || '',
    });
    setEditingId(s.id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/superviseurs/${editingId}`, {
          nom: form.nom,
          prenom: form.prenom,
          departement: form.departement,
          telephone: form.telephone,
        });
        setSuccess('Superviseur mis à jour !');
      } else {
        await api.post('/admin/superviseurs', form);
        setSuccess('Superviseur créé avec succès !');
      }
      setShowForm(false);
      setEditingId(null);
      await charger();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSupprimer = async (id: string) => {
    if (!confirm('Supprimer ce superviseur ? Cette action supprimera également son compte utilisateur.')) return;
    try {
      await api.delete(`/admin/superviseurs/${id}`);
      await charger();
    } catch (err) {
      alert((err as ApiError).response?.data?.message || 'Erreur');
    }
  };

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

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestion des superviseurs</h2>
            <p className="text-gray-500 text-sm mt-1">{superviseurs.length} superviseur{superviseurs.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/supervisions"
              className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Gérer les affectations
            </Link>
            <button onClick={ouvrirCreation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              + Créer superviseur
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-6">
              {editingId ? '✏️ Modifier le superviseur' : '➕ Créer un superviseur'}
            </h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                    <input type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" name="nom" value={form.nom} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <input type="text" name="departement" value={form.departement} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" name="telephone" value={form.telephone} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2.5 rounded-lg transition">
                  {isSaving ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer le compte')}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : superviseurs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">👨‍🏫</p>
            <p className="text-gray-500">Aucun superviseur enregistré.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Superviseur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Département</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Étudiants</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {superviseurs.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                          {s.prenom?.[0]}{s.nom?.[0]}
                        </div>
                        <span className="font-medium text-gray-800">{s.prenom} {s.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.utilisateur?.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.departement || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s._count?.supervisions ?? 0}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        s.utilisateur?.estActif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.utilisateur?.estActif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(s)}
                          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-lg">
                          Modifier
                        </button>
                        <button onClick={() => handleSupprimer(s.id)}
                          className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-lg">
                          Supprimer
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
    </div>
  );
}
