import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BadgeMessages() {
  const [nonLus, setNonLus] = useState(0);

  useEffect(() => {
    chargerNonLus();
    const interval = setInterval(chargerNonLus, 15000); // refresh toutes les 15s
    return () => clearInterval(interval);
  }, []);

  const chargerNonLus = async () => {
    try {
      const response = await api.get('/messagerie/non-lus');
      setNonLus(response.data.data.count);
    } catch (err) {
      // silencieux
    }
  };

  return (
    <Link to="/messagerie" className="relative flex items-center text-sm text-gray-600 hover:text-green-700 transition">
      <span>Messages</span>
      {nonLus > 0 && (
        <span className="ml-1.5 bg-green-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
          {nonLus > 99 ? '99+' : nonLus}
        </span>
      )}
    </Link>
  );
}