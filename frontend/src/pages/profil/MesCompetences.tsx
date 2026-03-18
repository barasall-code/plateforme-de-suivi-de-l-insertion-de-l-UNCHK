import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

interface UserCompetence {
  competenceId: string;
  niveauMaitrise: string;
  competence: {
    nomCompetence: string;
    categorie: string;
  };
}

const NIVEAUX = ['debutant', 'intermediaire', 'avance', 'expert'];
const CATEGORIES = [
  { value: 'technique', label: 'Technique' },
  { value: 'transversale', label: 'Transversale' },
  { value: 'linguistique', label: 'Linguistique' },
];

const niveauColor = (n: string) => {
  const m: Record<string, string> = {
    debutant: 'bg-gray-100 text-gray-600',
    intermediaire: 'bg-blue-100 text-blue-700',
    avance: 'bg-green-100 text-green-700',
    expert: 'bg-purple-100 text-purple-700',
  };
  return m[n] ?? 'bg-gray-100 text-gray-600';
};

export default function MesCompetences() {
  const [competences, setCompetences] = useState<UserCompetence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nomCompetence, setNomCompetence] = useState('');
  const [categorie, setCategorie] = useState('technique');
  const [niveauMaitrise, setNiveauMaitrise] = useState('intermediaire');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNiveau, setEditNiveau] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const response = await api.get('/competences/mes-competences');
      setCompetences(response.data.data);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleAjouter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCompetence.trim()) return;
    setError('');
    setIsAdding(true);
    try {
      await api.post('/competences/mes-competences', { nomCompetence: nomCompetence.trim(), categorie, niveauMaitrise });
      setNomCompetence('');
      setSuccess('Compétence ajoutée !');
      await charger();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setIsAdding(false);
    }
  };

  const handleModifierNiveau = async (competenceId: string) => {
    try {
      await api.put(`/competences/mes-competences/${competenceId}`, { niveauMaitrise: editNiveau });
      setEditingId(null);
      await charger();
    } catch (err) {
      alert((err as ApiError).response?.data?.message || 'Erreur');
    }
  };

  const handleSupprimer = async (competenceId: string) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await api.delete(`/competences/mes-competences/${competenceId}`);
      await charger();
    } catch (err) {
      alert((err as ApiError).response?.data?.message || 'Erreur');
    }
  };

  const groupes = competences.reduce<Record<string, UserCompetence[]>>((acc, c) => {
    const cat = c.competence.categorie;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {} as Record<string, UserCompetence[]>);

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
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mes compétences</h2>
            <p className="text-gray-500 text-sm mt-1">{competences.length} compétence{competences.length > 1 ? 's' : ''} enregistrée{competences.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
        )}

        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">➕ Ajouter une compétence</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleAjouter} className="space-y-3">
            <div className="flex gap-3">
              <input type="text" value={nomCompetence} onChange={(e) => setNomCompetence(e.target.value)}
                placeholder="Ex: React, Python, Gestion de projet..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
                <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Niveau de maîtrise</label>
                <select value={niveauMaitrise} onChange={(e) => setNiveauMaitrise(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  {NIVEAUX.map(n => (
                    <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={isAdding}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
              {isAdding ? 'Ajout...' : '+ Ajouter'}
            </button>
          </form>
        </div>

        {/* Liste par catégorie */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : competences.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-gray-500">Aucune compétence enregistrée.</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez vos compétences pour enrichir votre profil.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupes).map(([cat, items]) => (
              <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-4 capitalize">
                  {cat === 'technique' ? '💻 Compétences techniques' :
                   cat === 'transversale' ? '🤝 Compétences transversales' :
                   '🌍 Compétences linguistiques'}
                </h3>
                <div className="space-y-3">
                  {items.map((c) => (
                    <div key={c.competenceId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-800">{c.competence.nomCompetence}</span>
                        {editingId === c.competenceId ? (
                          <div className="flex items-center gap-2">
                            <select value={editNiveau} onChange={(e) => setEditNiveau(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-xs">
                              {NIVEAUX.map(n => (
                                <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                              ))}
                            </select>
                            <button onClick={() => handleModifierNiveau(c.competenceId)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded">✓</button>
                            <button onClick={() => setEditingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                          </div>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${niveauColor(c.niveauMaitrise)}`}>
                            {c.niveauMaitrise}
                          </span>
                        )}
                      </div>
                      {editingId !== c.competenceId && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(c.competenceId); setEditNiveau(c.niveauMaitrise); }}
                            className="text-xs text-blue-600 hover:text-blue-800">Modifier</button>
                          <button onClick={() => handleSupprimer(c.competenceId)}
                            className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
