import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { getFileUrl } from '../../services/api';

export default function MonProfil() {
  const { user } = useAuth();
  const [profil, setProfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({});

  // Upload états
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => { chargerProfil(); }, []);

  const chargerProfil = async () => {
    try {
      const response = await api.get('/profil');
      setProfil(response.data.data);
      setForm(response.data.data);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildPayload = (source: any) => {
    const fields = ['nom', 'prenom', 'filiere', 'niveauEtude', 'promotion', 'telephone', 'cvUrl', 'linkedinUrl', 'photoUrl', 'dateNaissance'];
    const payload: Record<string, any> = {};
    for (const key of fields) {
      const val = source[key];
      if (val !== null && val !== undefined) payload[key] = val;
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const response = await api.put('/profil', buildPayload(form));
      setProfil(response.data.data);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append('fichier', file);
      formData.append('type', 'cv');
      const response = await api.post('/upload/fichier', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const cvUrl = response.data.data.url;
      await api.put('/profil', buildPayload({ ...profil, cvUrl }));
      setProfil({ ...profil, cvUrl });
      setSuccess('CV uploadé avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors du téléchargement du CV');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('fichier', file);
      formData.append('type', 'photo');
      const response = await api.post('/upload/fichier', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const photoUrl = response.data.data.url;
      await api.put('/profil', buildPayload({ ...profil, photoUrl }));
      setProfil({ ...profil, photoUrl });
      setSuccess('Photo uploadée avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors du téléchargement de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getFileIcon = (url: string) => {
    if (!url) return '📄';
    if (url.endsWith('.pdf')) return '📕';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return '📘';
    return '📄';
  };

  const getFileName = (url: string) => {
    if (!url) return '';
    return url.split('/').pop() || url;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-green-700">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
              ✏️ Modifier
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

        {/* En-tête profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profil?.photoUrl ? (
                <img src={getFileUrl(profil.photoUrl)} alt="Photo"
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-200" />
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                  {profil?.prenom?.[0]}{profil?.nom?.[0]}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 bg-green-600 hover:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition text-xs">
                {uploadingPhoto ? '⏳' : '📷'}
                <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{profil?.prenom} {profil?.nom}</h3>
              <p className="text-gray-500">{profil?.utilisateur?.email}</p>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Section Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">📁 Mes documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CV */}
            <div className={`border-2 rounded-xl p-4 ${profil?.cvUrl ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-300'}`}>
              <div className="text-center mb-3">
                <span className="text-3xl">{profil?.cvUrl ? getFileIcon(profil.cvUrl) : '📄'}</span>
                <p className="text-sm font-medium text-gray-700 mt-1">CV</p>
              </div>
              {profil?.cvUrl ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 truncate text-center" title={getFileName(profil.cvUrl)}>
                    {getFileName(profil.cvUrl)}
                  </p>
                  <a href={getFileUrl(profil.cvUrl)} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded-lg transition">
                    👁️ Voir le CV
                  </a>
                  <label className="block w-full text-center border border-gray-300 text-gray-600 text-xs font-medium py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    🔄 Remplacer
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCv} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-lg cursor-pointer transition">
                  {uploadingCv ? '⏳ Upload...' : '⬆️ Charger CV'}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCv} className="hidden" />
                </label>
              )}
            </div>

            {/* Lettre de motivation */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
              <div className="text-center mb-3">
                <span className="text-3xl">✉️</span>
                <p className="text-sm font-medium text-gray-700 mt-1">Lettre de motivation</p>
              </div>
              <p className="text-xs text-gray-400 text-center mb-3">Jointe lors des candidatures</p>
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-xs text-blue-600 text-center">Uploadée à chaque candidature</p>
              </div>
            </div>

            {/* Diplôme */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
              <div className="text-center mb-3">
                <span className="text-3xl">🎓</span>
                <p className="text-sm font-medium text-gray-700 mt-1">Diplôme</p>
              </div>
              <p className="text-xs text-gray-400 text-center mb-3">Joint lors des candidatures</p>
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-xs text-blue-600 text-center">Uploadé à chaque candidature</p>
              </div>
            </div>
          </div>

          {/* Liens externes */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
            {profil?.cvUrl && (
              <a href={`http://localhost:3001${profil.cvUrl}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                📄 Voir mon CV
              </a>
            )}
            {profil?.linkedinUrl && (
              <a href={profil.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                🔗 LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">👤 Informations personnelles</h3>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Numéro étudiant', value: profil?.numeroEtudiant },
                { label: 'Téléphone', value: profil?.telephone },
                { label: 'Filière', value: profil?.filiere },
                { label: "Niveau d'étude", value: profil?.niveauEtude },
                { label: 'Promotion', value: profil?.promotion },
                { label: 'LinkedIn', value: profil?.linkedinUrl, link: true },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  {item.link && item.value ? (
                    <a href={item.value} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline">Voir profil</a>
                  ) : (
                    <p className="text-sm font-medium text-gray-800">{item.value || '—'}</p>
                  )}
                </div>
              ))}
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
                    placeholder="+221 77 000 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
                  <input type="text" name="filiere" value={form.filiere || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Informatique" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude</label>
                  <select name="niveauEtude" value={form.niveauEtude || 'licence'} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="licence">Licence</option>
                    <option value="master1">Master 1</option>
                    <option value="master2">Master 2</option>
                    <option value="doctorat">Doctorat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                  <input type="text" name="promotion" value={form.promotion || ''} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="2026" />
                </div>
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