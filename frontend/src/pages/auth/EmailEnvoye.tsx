import { useNavigate } from 'react-router-dom';
export default function EmailEnvoye() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Vérifiez votre email !</h1>
        <p className="text-gray-600 mb-6">Un lien de confirmation a été envoyé à votre adresse. Cliquez dessus pour activer votre compte.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-amber-800 text-sm font-medium mb-1">💡 Conseil</p>
          <p className="text-amber-700 text-sm">Vérifiez aussi votre dossier <strong>spam</strong>. Le lien expire dans 24h.</p>
        </div>
        <button onClick={() => navigate('/login')} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
          Aller à la connexion
        </button>
      </div>
    </div>
  );
}