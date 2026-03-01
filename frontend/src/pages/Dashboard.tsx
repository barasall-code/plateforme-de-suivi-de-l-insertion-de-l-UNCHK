import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">UNCHK</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue 👋</h2>
        <p className="text-gray-500 mb-8">Plateforme de suivi d'insertion professionnelle de l'UNCHK</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/offres" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-800 mb-1">Offres disponibles</h3>
            <p className="text-gray-500 text-sm">Consultez les offres de stage et d'emploi</p>
          </Link>

          <Link to="/candidatures" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-800 mb-1">Mes candidatures</h3>
            <p className="text-gray-500 text-sm">Suivez l'état de vos candidatures</p>
          </Link>

          <Link to="/profil" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition block">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-semibold text-gray-800 mb-1">Mon profil</h3>
            <p className="text-gray-500 text-sm">Gérez vos informations personnelles</p>
          </Link>
        </div>
      </main>
    </div>
  );
}