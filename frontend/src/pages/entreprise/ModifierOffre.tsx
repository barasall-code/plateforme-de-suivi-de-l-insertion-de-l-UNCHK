import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

export default function ModifierOffre() {
  const { offreId } = useParams<{ offreId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [competence, setCompetence] = useState('');
  const [competences, setCompetences] = useState<string[]>([]);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    typeOffre: 'stage',
    domaine: '',
    niveauRequis: 'licence',
    localisation: '',
    modeTravail: 'presentiel',
    salaireMin: '',
    salaireMax: '',
    dureeMois: '',
    nombrePostes: '1',
    dateLimiteCandidature: '',
  });

  useEffect(() => {
    chargerOffre();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offreId]);

  const chargerOffre = async () => {
    try {
      const response = await api.get(`/offres/${offreId}`);
      const offre = response.data.data;
      setForm({
        titre: offre.titre || '',
        description: offre.description || '',
        typeOffre: offre.typeOffre || 'stage',
        domaine: offre.domaine || '',
        niveauRequis: offre.niveauRequis || 'licence',
        localisation: offre.localisation || '',
        modeTravail: offre.modeTravail || 'presentiel',
        salaireMin: offre.salaireMin?.toString() || '',
        salaireMax: offre.salaireMax?.toString() || '',
        dureeMois: offre.dureeMois?.toString() || '',
        nombrePostes: offre.nombrePostes?.toString() || '1',
        dateLimiteCandidature: offre.dateLimiteCandidature
          ? new Date(offre.dateLimiteCandidature).toISOString().split('T')[0]
          : '',
      });
      if (offre.competencesRequises) {
        setCompetences(Array.isArray(offre.competencesRequises) ? offre.competencesRequises : []);
      }
    } catch {
      setError('Impossible de charger cette offre');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ajouterCompetence = () => {
    if (competence.trim() && !competences.includes(competence.trim())) {
      setCompetences([...competences, competence.trim()]);
      setCompetence('');
    }
  };

  const supprimerCompetence = (c: string) => {
    setCompetences(competences.filter(x => x !== c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await api.put(`/offres/${offreId}`, {
        ...form,
        salaireMin: form.salaireMin ? Number(form.salaireMin) : undefined,
        salaireMax: form.salaireMax ? Number(form.salaireMax) : undefined,
        dureeMois: form.dureeMois ? Number(form.dureeMois) : undefined,
        nombrePostes: Number(form.nombrePostes),
        competencesRequises: competences.length > 0 ? competences : undefined,
      });
      navigate('/entreprise/dashboard');
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Erreur lors de la modification');
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
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all">
            ← Retour
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Modifier l'offre</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1 - Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg border-b pb-3">📋 Informations générales</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste</label>
              <input type="text" name="titre" value={form.titre} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Développeur React" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'offre</label>
                <select name="typeOffre" value={form.typeOffre} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
                <input type="text" name="domaine" value={form.domaine} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Informatique" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <input type="text" name="localisation" value={form.localisation} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Dakar" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode de travail</label>
                <select name="modeTravail" value={form.modeTravail} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="presentiel">Présentiel</option>
                  <option value="teletravail">Télétravail</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de postes</label>
                <input type="number" name="nombrePostes" value={form.nombrePostes} onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                <input type="date" name="dateLimiteCandidature" value={form.dateLimiteCandidature} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required />
              </div>
            </div>
          </div>

          {/* Section 2 - Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg border-b pb-3">📝 Description du poste</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description générale</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Décrivez le poste, les missions, les responsabilités..." required />
            </div>
          </div>

          {/* Section 3 - Compétences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg border-b pb-3">🎯 Compétences & Conditions</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude requis</label>
              <select name="niveauRequis" value={form.niveauRequis} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="licence">Licence</option>
                <option value="master1">Master 1</option>
                <option value="master2">Master 2</option>
                <option value="master">Master</option>
                <option value="doctorat">Doctorat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compétences requises</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={competence} onChange={(e) => setCompetence(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterCompetence(); }}}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: React, Python, SQL..." />
                <button type="button" onClick={ajouterCompetence}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition">
                  Ajouter
                </button>
              </div>
              {competences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {competences.map((c) => (
                    <span key={c} className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      {c}
                      <button type="button" onClick={() => supprimerCompetence(c)}
                        className="text-green-500 hover:text-red-500 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (mois)</label>
                <input type="number" name="dureeMois" value={form.dureeMois} onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire min (FCFA)</label>
                <input type="number" name="salaireMin" value={form.salaireMin} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire max (FCFA)</label>
                <input type="number" name="salaireMax" value={form.salaireMax} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 rounded-lg transition">
              {isSaving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
            </button>
            <Link to="/entreprise/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-center">
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
