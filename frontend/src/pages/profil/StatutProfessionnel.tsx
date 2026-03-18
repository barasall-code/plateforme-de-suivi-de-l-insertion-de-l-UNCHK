import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

type ApiError = { response?: { data?: { message?: string } } };

interface StatutPro {
  id: string;
  typeStatut: string;
  nomEntreprise?: string;
  poste?: string;
  typeContrat?: string;
  salaireBrutAnnuel?: number;
  dateDebut: string;
  dateDeclaration: string;
  dateFin?: string;
  secteurActivite?: string;
  ville?: string;
  pays?: string;
  estValide?: boolean;
}

const TYPES = [
  { value: 'en_emploi', label: 'En emploi' },
  { value: 'en_recherche', label: 'En recherche d\'emploi' },
  { value: 'en_formation', label: 'En formation' },
  { value: 'autre', label: 'Autre' },
];

const labelType = (t: string) => TYPES.find(x => x.value === t)?.label ?? t;

const emptyForm = {
  typeStatut: 'en_emploi',
  nomEntreprise: '',
  poste: '',
  typeContrat: '',
  salaireBrutAnnuel: '',
  dateDebut: '',
  dateFin: '',
  secteurActivite: '',
  ville: '',
  pays: '',
};

export default function StatutProfessionnel() {
  const [statuts, setStatuts] = useState<StatutPro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const response = await api.get('/statut-professionnel');
      setStatuts(response.data.data);
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ouvrirCreation = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const ouvrirEdition = (s: StatutPro) => {
    setForm({
      typeStatut: s.typeStatut,
      nomEntreprise: s.nomEntreprise || '',
      poste: s.poste || '',
      typeContrat: s.typeContrat || '',
      salaireBrutAnnuel: s.salaireBrutAnnuel?.toString() || '',
      dateDebut: s.dateDebut ? new Date(s.dateDebut).toISOString().split('T')[0] : '',
      dateFin: s.dateFin ? new Date(s.dateFin).toISOString().split('T')[0] : '',
      secteurActivite: s.secteurActivite || '',
      ville: s.ville || '',
      pays: s.pays || '',
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
      const payload = {
        ...form,
        salaireBrutAnnuel: form.salaireBrutAnnuel ? Number(form.salaireBrutAnnuel) : undefined,
        dateFin: form.dateFin || undefined,
        nomEntreprise: form.nomEntreprise || undefined,
        poste: form.poste || undefined,
        typeContrat: form.typeContrat || undefined,
        secteurActivite: form.secteurActivite || undefined,
        ville: form.ville || undefined,
        pays: form.pays || undefined,
      };
      if (editingId) {
        await api.put(`/statut-professionnel/${editingId}`, payload);
      } else {
        await api.post('/statut-professionnel', payload);
      }
      setSuccess(editingId ? 'Statut mis à jour !' : 'Statut déclaré avec succès !');
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
    if (!confirm('Supprimer ce statut ?')) return;
    try {
      await api.delete(`/statut-professionnel/${id}`);
      await charger();
    } catch (err) {
      alert((err as ApiError).response?.data?.message || 'Erreur');
    }
  };

  const badgeColor = (t: string) => {
    const colors: Record<string, string> = {
      en_emploi: 'bg-green-100 text-green-700',
      en_recherche: 'bg-yellow-100 text-yellow-700',
      en_formation: 'bg-blue-100 text-blue-700',
      autre: 'bg-gray-100 text-gray-700',
    };
    return colors[t] ?? 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50 shadow-sm hover:shadow-md transition-all duration-200 group">
            <span className="text-base group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Retour
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mon statut professionnel</h2>
            <p className="text-gray-500 text-sm mt-1">Déclarez votre situation professionnelle actuelle</p>
          </div>
          <button onClick={ouvrirCreation}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + Nouvelle déclaration
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-6">
              {editingId ? '✏️ Modifier la déclaration' : '📝 Nouvelle déclaration'}
            </h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation *</label>
                <select name="typeStatut" value={form.typeStatut} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {(form.typeStatut === 'en_emploi' || form.typeStatut === 'en_formation') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {form.typeStatut === 'en_formation' ? 'Établissement' : 'Entreprise'}
                    </label>
                    <input type="text" name="nomEntreprise" value={form.nomEntreprise} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {form.typeStatut === 'en_formation' ? 'Formation / Diplôme' : 'Poste'}
                    </label>
                    <input type="text" name="poste" value={form.poste} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              )}

              {form.typeStatut === 'en_emploi' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                    <select name="typeContrat" value={form.typeContrat} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">— Sélectionner —</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Alternance">Alternance</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salaire annuel brut (FCFA)</label>
                    <input type="number" name="salaireBrutAnnuel" value={form.salaireBrutAnnuel} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                  <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
                  <input type="text" name="secteurActivite" value={form.secteurActivite} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input type="text" name="ville" value={form.ville} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input type="text" name="pays" value={form.pays} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2.5 rounded-lg transition">
                  {isSaving ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Déclarer')}
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
        ) : statuts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">💼</p>
            <p className="text-gray-500">Aucune déclaration enregistrée.</p>
            <p className="text-sm text-gray-400 mt-1">Déclarez votre situation pour que votre superviseur puisse suivre votre insertion.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {statuts.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${badgeColor(s.typeStatut)}`}>
                      {labelType(s.typeStatut)}
                    </span>
                    {s.estValide && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Validé</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => ouvrirEdition(s)}
                      className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-lg">
                      Modifier
                    </button>
                    <button onClick={() => handleSupprimer(s.id)}
                      className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-lg">
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {s.nomEntreprise && (
                    <div>
                      <span className="text-gray-400">Entreprise/Établissement : </span>
                      <span className="text-gray-700 font-medium">{s.nomEntreprise}</span>
                    </div>
                  )}
                  {s.poste && (
                    <div>
                      <span className="text-gray-400">Poste / Formation : </span>
                      <span className="text-gray-700 font-medium">{s.poste}</span>
                    </div>
                  )}
                  {s.typeContrat && (
                    <div>
                      <span className="text-gray-400">Contrat : </span>
                      <span className="text-gray-700 font-medium">{s.typeContrat}</span>
                    </div>
                  )}
                  {s.ville && (
                    <div>
                      <span className="text-gray-400">Lieu : </span>
                      <span className="text-gray-700 font-medium">{s.ville}{s.pays ? `, ${s.pays}` : ''}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Depuis : </span>
                    <span className="text-gray-700 font-medium">
                      {new Date(s.dateDebut).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Déclaré le {new Date(s.dateDeclaration).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
