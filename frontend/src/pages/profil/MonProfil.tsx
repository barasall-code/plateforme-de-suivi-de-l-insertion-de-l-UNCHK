import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MonProfil() {
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
          <h1 className="text-xl font-bold text-green-700">UNCHK</h1>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
              {profil?.prenom?.[0]}{profil?.nom?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{profil?.prenom} {profil?.nom}</h3>
              <p className="text-gray-500">{profil?.utilisateur?.email}</p>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Numéro étudiant</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.numeroEtudiant || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.telephone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Filière</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.filiere || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Niveau d'étude</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.niveauEtude || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Promotion</p>
                  <p className="text-sm font-medium text-gray-800">{profil?.promotion || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">CV</p>
                  {profil?.cvUrl ? (
                    <a href={profil.cvUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline">Voir mon CV</a>
                  ) : (
                    <p className="text-sm text-gray-400">Non renseigné</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">LinkedIn</p>
                  {profil?.linkedinUrl ? (
                    <a href={profil.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline">Voir profil</a>
                  ) : (
                    <p className="text-sm text-gray-400">Non renseigné</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" name="prenom" value={form.prenom || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" name="nom" value={form.nom || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="text" name="telephone" value={form.telephone || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: +221 77 000 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
                  <input type="text" name="filiere" value={form.filiere || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Informatique" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude</label>
                  <select name="niveauEtude" value={form.niveauEtude || 'licence'} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="licence">Licence</option>
                    <option value="master">Master</option>
                    <option value="doctorat">Doctorat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                  <input type="text" name="promotion" value={form.promotion || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 2024" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien CV</label>
                <input type="url" name="cvUrl" value={form.cvUrl || ''} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input type="url" name="linkedinUrl" value={form.linkedinUrl || ''} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://linkedin.com/in/..." />
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