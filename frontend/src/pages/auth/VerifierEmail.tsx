import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
export default function VerifierEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statut, setStatut] = useState('chargement');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatut('erreur'); setMessage('Token manquant.'); return; }
    api.get('/auth/verifier-email?token=' + token)
      .then(() => { setStatut('succes'); setTimeout(() => navigate('/login'), 3000); })
      .catch((err) => { setStatut('erreur'); setMessage(err.response?.data?.message || 'Lien invalide.'); });
  }, []);
  const bg = statut === 'succes' ? '#dcfce7' : statut === 'erreur' ? '#fee2e2' : '#f3f4f6';
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: bg }}>
          {statut === 'chargement' && <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />}
          {statut === 'succes' && <span className="text-3xl">✅</span>}
          {statut === 'erreur' && <span className="text-3xl">❌</span>}
        </div>
        {statut === 'chargement' && <p className="text-gray-500">Vérification en cours...</p>}
        {statut === 'succes' && <><h2 className="text-xl font-bold text-green-700 mb-2">Email vérifié !</h2><p className="text-gray-600">Redirection en cours...</p></>}
        {statut === 'erreur' && <><h2 className="text-xl font-bold text-red-700 mb-2">Lien invalide</h2><p className="text-gray-600 mb-4">{message}</p><button onClick={() => navigate('/login')} className="bg-green-600 text-white px-6 py-2 rounded-lg">Retour connexion</button></>}
      </div>
    </div>
  );
}