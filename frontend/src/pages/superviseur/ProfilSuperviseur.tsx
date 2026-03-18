import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

interface SuperviseurProfil {
  nom: string;
  prenom: string;
  departement?: string;
  telephone?: string;
  utilisateur?: { email: string; dateCreation?: string };
  supervisions?: unknown[];
}

export default function ProfilSuperviseur() {
  const [profil, setProfil] = useState<SuperviseurProfil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', departement: '', telephone: '' });

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const response = await api.get('/superviseur/profil');
      setProfil(response.data.data);
      setForm({
        nom: response.data.data.nom || '',
        prenom: response.data.data.prenom || '',
        departement: response.data.data.departement || '',
        telephone: response.data.data.telephone || '',
      });
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const response = await api.put('/superviseur/profil', form);
      setProfil({ ...profil, ...response.data.data });
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to="/superviseur/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              ✏️ Modifier
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-700">
              {profil?.prenom?.[0]}{profil?.nom?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{profil?.prenom} {profil?.nom}</h3>
              <p className="text-gray-500 text-sm">{profil?.utilisateur?.email}</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Superviseur</span>
            </div>
          </div>

          {isEditing ? (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <input type="text" name="departement" value={form.departement} onChange={handleChange}
                    placeholder="Ex: Informatique, Sciences de l'éducation..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" name="telephone" value={form.telephone} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2.5 rounded-lg transition">
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                    Annuler
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Prénom</p>
                <p className="text-sm font-medium text-gray-800">{profil?.prenom || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nom</p>
                <p className="text-sm font-medium text-gray-800">{profil?.nom || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Département</p>
                <p className="text-sm font-medium text-gray-800">{profil?.departement || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="text-sm font-medium text-gray-800">{profil?.telephone || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-800">{profil?.utilisateur?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Étudiants supervisés</p>
                <p className="text-sm font-medium text-gray-800">
                  {profil?.supervisions?.length ?? 0} étudiant{(profil?.supervisions?.length ?? 0) > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Membre depuis</p>
                <p className="text-sm font-medium text-gray-800">
                  {profil?.utilisateur?.dateCreation
                    ? new Date(profil.utilisateur.dateCreation).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
