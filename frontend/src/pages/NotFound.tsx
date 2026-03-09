import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      <div className="mb-10">
        <img src="/logo2_unchk.png" alt="UNCHK" className="h-12 w-auto bg-white/10 rounded-xl p-2" />
      </div>
      <h1 className="text-9xl font-black text-green-500 mb-6 select-none">404</h1>
      <div className="text-center mb-10 max-w-md">
        <h2 className="text-2xl font-bold text-white mb-3">Page introuvable</h2>
        <p className="text-gray-400 text-lg">La page que vous recherchez n'existe pas.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition text-center">
          ← Retour à l'accueil
        </Link>
        <Link to="/login" className="border border-green-700 text-green-400 hover:bg-green-900/30 font-semibold px-8 py-3 rounded-xl transition text-center">
          Se connecter
        </Link>
      </div>
      <p className="absolute bottom-6 text-gray-600 text-sm">© 2026 Université Numérique Cheikh Hamidou Kane</p>
    </div>
  );
}