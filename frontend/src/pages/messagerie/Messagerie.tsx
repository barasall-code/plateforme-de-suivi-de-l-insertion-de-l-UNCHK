import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Messagerie() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [convActive, setConvActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [contenu, setContenu] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chargerConversations();
  }, []);

  useEffect(() => {
    // Auto-créer conversation si etudiantId + entrepriseId dans URL
    const etudiantId = searchParams.get('etudiantId');
    const entrepriseId = searchParams.get('entrepriseId');
    if (etudiantId && entrepriseId) {
      ouvrirOuCreerConversation(etudiantId, entrepriseId);
    }
  }, [searchParams]);
useEffect(() => {
    if (!convActive) return;
    chargerMessages(convActive.id);
    const interval = setInterval(() => chargerMessages(convActive.id), 5000);
    return () => clearInterval(interval);
  }, [convActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chargerConversations = async () => {
    try {
      const response = await api.get('/messagerie/conversations');
      setConversations(response.data.data);
      if (response.data.data.length > 0 && !convActive) {
        setConvActive(response.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const ouvrirOuCreerConversation = async (etudiantId: string, entrepriseId: string) => {
    try {
      const response = await api.post('/messagerie/conversations', { etudiantId, entrepriseId });
      setConvActive(response.data.data);
      await chargerConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const chargerMessages = async (conversationId: string) => {
    try {
      const response = await api.get(`/messagerie/conversations/${conversationId}/messages`);
      setMessages(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnvoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenu.trim() || !convActive) return;
    setIsSending(true);
    try {
      const response = await api.post(`/messagerie/conversations/${convActive.id}/messages`, { contenu });
      setMessages(prev => [...prev, response.data.data]);
      setContenu('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getNomConversation = (conv: any) => {
    if (user?.role === 'etudiant') return conv.entreprise?.nomEntreprise || 'Entreprise';
    return `${conv.etudiant?.prenom} ${conv.etudiant?.nom}` || 'Étudiant';
  };

  const getInitiales = (conv: any) => {
    const nom = getNomConversation(conv);
    return nom.slice(0, 2).toUpperCase();
  };

  const getDernierMessage = (conv: any) => {
    if (!conv.messages || conv.messages.length === 0) return 'Aucun message';
    return conv.messages[0].contenu.length > 40
      ? conv.messages[0].contenu.slice(0, 40) + '...'
      : conv.messages[0].contenu;
  };

  const formatHeure = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatHeure(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const dashboardLink = user?.role === 'entreprise' ? '/entreprise/dashboard' :
    user?.role === 'superviseur' ? '/superviseur/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" /></Link>
          <Link to={dashboardLink} className="text-sm text-gray-600 hover:text-green-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-6 gap-4" style={{ height: 'calc(100vh - 73px)' }}>

        {/* Liste conversations */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Conversations</h2>
            <p className="text-xs text-gray-500 mt-0.5">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-gray-500 text-sm">Aucune conversation</p>
                {user?.role === 'etudiant' && (
                  <p className="text-gray-400 text-xs mt-2">Postulez à une offre pour démarrer une conversation</p>
                )}
              </div>
            ) : (
              conversations.map((conv) => (
                <button key={conv.id} onClick={() => setConvActive(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left border-b border-gray-50 ${convActive?.id === conv.id ? 'bg-green-50 border-l-2 border-l-green-600' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${convActive?.id === conv.id ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                    {getInitiales(conv)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{getNomConversation(conv)}</p>
                    <p className="text-xs text-gray-400 truncate">{getDernierMessage(conv)}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {conv.messages?.[0] ? formatDate(conv.messages[0].dateEnvoi) : ''}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Zone chat */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {!convActive ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl mb-4">💬</p>
                <p className="text-gray-500 font-medium">Sélectionnez une conversation</p>
                <p className="text-gray-400 text-sm mt-1">ou démarrez-en une nouvelle</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                  {getInitiales(convActive)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{getNomConversation(convActive)}</p>
                  <p className="text-xs text-gray-400">
                    {user?.role === 'etudiant'
                      ? convActive.entreprise?.secteurActivite
                      : convActive.etudiant?.filiere}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">👋</p>
                    <p className="text-gray-400 text-sm">Démarrez la conversation !</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const estMoi = msg.expediteurId === user?.userId ||
                      (user?.role === msg.expediteur?.typeUtilisateur);
                    return (
                      <div key={msg.id} className={`flex ${estMoi ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                          estMoi
                            ? 'bg-green-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.contenu}</p>
                          <p className={`text-xs mt-1 ${estMoi ? 'text-green-200' : 'text-gray-400'}`}>
                            {formatHeure(msg.dateEnvoi)}
                            {estMoi && <span className="ml-1">{msg.lu ? '✓✓' : '✓'}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input message */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleEnvoyer} className="flex gap-3">
                  <input type="text" value={contenu} onChange={(e) => setContenu(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  <button type="submit" disabled={isSending || !contenu.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-5 py-2.5 rounded-xl transition font-medium text-sm flex items-center gap-2">
                    {isSending ? '⏳' : '📤'} Envoyer
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}