import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function CreerOffre() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [competence, setCompetence] = useState('');
  const [competences, setCompetences] = useState<string[]>([]);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    profilRecherche: '',
    conditionsTravail: '',
    modalitesCandidature: '',
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
    setIsLoading(true);
    try {
      await api.post('/offres', {
        ...form,
        salaireMin: form.salaireMin ? Number(form.salaireMin) : undefined,
        salaireMax: form.salaireMax ? Number(form.salaireMax) : undefined,
        dureeMois: form.dureeMois ? Number(form.dureeMois) : undefined,
        nombrePostes: Number(form.nombrePostes),
        competencesRequises: competences.length > 0 ? competences : undefined,
      });
      navigate('/entreprise/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Créer une offre</h2>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profil recherché</label>
              <textarea name="profilRecherche" value={form.profilRecherche} onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Décrivez le profil idéal, les qualités recherchées..." />
            </div>
          </div>

          {/* Section 3 - Compétences requises */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg border-b pb-3">🎯 Compétences requises</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude requis</label>
              <select name="niveauRequis" value={form.niveauRequis} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="licence">Licence</option>
                <option value="master">Master</option>
                <option value="doctorat">Doctorat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compétences techniques</label>
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
          </div>

          {/* Section 4 - Conditions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg border-b pb-3">💼 Conditions de travail</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (mois)</label>
                <input type="number" name="dureeMois" value={form.dureeMois} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire min (FCFA)</label>
                <input type="number" name="salaireMin" value={form.salaireMin} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 150000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire max (FCFA)</label>
                <input type="number" name="salaireMax" value={form.salaireMax} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 300000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de travail</label>
              <textarea name="conditionsTravail" value={form.conditionsTravail} onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Horaires, avantages, équipements fournis..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalités de candidature</label>
              <textarea name="modalitesCandidature" value={form.modalitesCandidature} onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Documents requis, processus de sélection..." />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50">
              {isLoading ? 'Création...' : 'Créer l\'offre'}
            </button>
            <Link to="/entreprise/dashboard"
              className="border border-gray-300 text-gray-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}