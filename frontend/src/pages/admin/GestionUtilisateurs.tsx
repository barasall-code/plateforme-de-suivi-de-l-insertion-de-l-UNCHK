import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState<'tous' | 'etudiant' | 'entreprise' | 'admin'>('tous');

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    try {
      const response = await api.get('/admin/utilisateurs');
      setUtilisateurs(response.data.data);
    } catch (err) {
      // erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.put(`/admin/utilisateurs/${id}/toggle`);
      await chargerUtilisateurs();
    } catch (err) {
      // erreur silencieuse
    }
  };

  const roleColors: Record<string, string> = {
    etudiant: 'bg-blue-100 text-blue-700',
    entreprise: 'bg-green-100 text-green-700',
    admin: 'bg-red-100 text-red-700',
    superviseur: 'bg-purple-100 text-purple-700',
  };

  const utilisateursFiltres = utilisateurs.filter(u => {
    const matchRole = filtre === 'tous' || u.typeUtilisateur === filtre;
    const matchSearch = search === '' ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.etudiant?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      u.etudiant?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      u.entreprise?.nomEntreprise?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const getNom = (u: any) => {
    if (u.etudiant) return `${u.etudiant.prenom} ${u.etudiant.nom}`;
    if (u.entreprise) return u.entreprise.nomEntreprise;
    return '—';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h2>
          <p className="text-gray-500">{utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''}</p>
        </div>

        <div className="flex gap-3 mb-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="flex gap-3 mb-6">
          {(['tous', 'etudiant', 'entreprise', 'admin'] as const).map((f) => (
            <button key={f} onClick={() => setFiltre(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtre === f ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}>
              {f === 'tous' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {utilisateursFiltres.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{getNom(u)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[u.typeUtilisateur] || 'bg-gray-100 text-gray-600'}`}>
                        {u.typeUtilisateur}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.estActif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.estActif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(u.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(u.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                          u.estActif
                            ? 'border border-red-300 text-red-600 hover:bg-red-50'
                            : 'border border-green-300 text-green-600 hover:bg-green-50'
                        }`}>
                        {u.estActif ? 'Désactiver' : 'Activer'}
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