import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Notification {
  id: string;
  titre: string;
  message: string;
  estLue: boolean;
  dateCreation: string;
  lienAction?: string;
  typeNotification: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chargerNotifications();
    const interval = setInterval(chargerNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const chargerNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
      setNonLues(response.data.data.nonLues);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.estLue) {
      await api.put(`/notifications/${notif.id}/lire`);
      await chargerNotifications();
    }
    if (notif.lienAction) navigate(notif.lienAction);
    setIsOpen(false);
  };

  const marquerToutesLues = async () => {
    await api.put('/notifications/lire-tout');
    await chargerNotifications();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-green-700 transition"
      >
        🔔
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {nonLues > 0 && (
              <button onClick={marquerToutesLues}
                className="text-xs text-green-600 hover:text-green-700 font-medium">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                    !notif.estLue ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-medium ${!notif.estLue ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.titre}
                    </p>
                    {!notif.estLue && (
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}