import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfilEntreprise() {
  const { user } = useAuth();
  const [profil, setProfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    chargerProfil();
  }, []);

  const chargerProfil = async () => {
    try {
      const response = await api.get('/profil');
      setProfil(response.data.data);
      setForm(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const response = await api.put('/profil', form);
      setProfil(response.data.data);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK — Entreprise</h1>
          <Link to="/entreprise/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Profil entreprise</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
              Modifier
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            {profil?.logoUrl ? (
              <img src={profil.logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                {profil?.nomEntreprise?.[0]}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{profil?.nomEntreprise}</h3>
              <p className="text-gray-500">{profil?.utilisateur?.email}</p>
              <div className="flex gap-2 mt-1">
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  entreprise
                </span>
                {profil?.estValide ? (
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    ✓ Validée
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    En attente de validation
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Secteur d'activité</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.secteurActivite || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Taille</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.tailleEntreprise || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ville</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.ville || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pays</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.pays || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Site web</p>
                  {profil?.siteWeb ? (
                    <a href={profil.siteWeb} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline">{profil.siteWeb}</a>
                  ) : <p className="text-sm text-gray-400">Non renseigné</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">SIRET</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.siret || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{profil?.description || 'Aucune description renseignée.'}</p>
              </div>
              {profil?.logoUrl && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Logo URL</p>
                  <p className="text-sm text-gray-700">{profil.logoUrl}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                  <input type="text" name="nomEntreprise" value={form.nomEntreprise || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
                  <input type="text" name="secteurActivite" value={form.secteurActivite || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                  <select name="tailleEntreprise" value={form.tailleEntreprise || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Sélectionner</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201-500">201-500 employés</option>
                    <option value="500+">500+ employés</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input type="text" name="ville" value={form.ville || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Dakar" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input type="text" name="pays" value={form.pays || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Sénégal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                  <input type="url" name="siteWeb" value={form.siteWeb || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                  <input type="text" name="siret" value={form.siret || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
                  <input type="url" name="logoUrl" value={form.logoUrl || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description de l'entreprise</label>
                <textarea name="description" value={form.description || ''} onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Décrivez votre entreprise, votre mission, vos valeurs..." />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2.5 rounded-lg transition disabled:opacity-50">
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setForm(profil); }}
                  className="border border-gray-300 text-gray-600 px-8 py-2.5 rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}