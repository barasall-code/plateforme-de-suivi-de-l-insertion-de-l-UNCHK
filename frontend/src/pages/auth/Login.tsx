import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, motDePasse);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'entreprise') navigate('/entreprise/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'superviseur') navigate('/superviseur/dashboard');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 to-emerald-800 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-green-700 font-bold text-lg">U</span>
            </div>
            <span className="text-white font-bold text-xl">UNCHK</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Plateforme de suivi<br />d'insertion<br />professionnelle
          </h1>
          <p className="text-green-200 text-lg">
            Connectez étudiants, entreprises et équipes pédagogiques en un seul espace.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '🎓', label: 'Étudiants', desc: 'Trouvez des offres et suivez vos candidatures' },
            { icon: '🏢', label: 'Entreprises', desc: 'Publiez vos offres et recrutez les meilleurs talents' },
            { icon: '👁️', label: 'Superviseurs', desc: 'Suivez l\'insertion de vos étudiants' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white font-semibold">{item.label}</p>
                <p className="text-green-200 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-green-700 font-bold text-xl">UNCHK</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue 👋</h2>
          <p className="text-gray-500 mb-8">Connectez-vous à votre espace</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition shadow-sm">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
              Créer un compte
            </Link>
          </p>

          {/* Comptes de test */}
          <div className="mt-8 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Comptes de test</p>
            <div className="space-y-2">
              {[
                { role: 'Étudiant', email: 'bara.sall@unchk.edu.sn', color: 'bg-blue-50 text-blue-700' },
                { role: 'Entreprise', email: 'entreprise@test.sn', color: 'bg-green-50 text-green-700' },
                { role: 'Admin', email: 'admin@unchk.sn', color: 'bg-red-50 text-red-700' },
                { role: 'Superviseur', email: 'superviseur@unchk.sn', color: 'bg-purple-50 text-purple-700' },
              ].map((compte) => (
                <button key={compte.role} type="button"
                  onClick={() => { setEmail(compte.email); setMotDePasse(''); }}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-xs font-medium ${compte.color} hover:opacity-80 transition`}>
                  <span>{compte.role}</span>
                  <span className="opacity-70">{compte.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}