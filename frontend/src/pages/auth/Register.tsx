import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

type Role = 'etudiant' | 'diplome' | 'entreprise';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Champs communs
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepteCGU, setAccepteCGU] = useState(false);

  // Champs étudiant
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [filiere, setFiliere] = useState('');
  const [niveauEtude, setNiveauEtude] = useState('');
  const [promotion, setPromotion] = useState('');
  const [telephone, setTelephone] = useState('');
  const [situationActuelle, setSituationActuelle] = useState('');

  // Champs entreprise
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [secteurActivite, setSecteurActivite] = useState('');
  const [ville, setVille] = useState('');
  const [siteWeb, setSiteWeb] = useState('');

  const handleSelectRole = (r: Role) => {
    setRole(r);
    setSituationActuelle(r === 'diplome' ? 'en_recherche_emploi' : 'en_cours_etude');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (motDePasse !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!accepteCGU) {
      setError('Vous devez accepter la politique de confidentialité pour créer votre compte');
      return;
    }

    setIsLoading(true);
    try {
      const data: any = { email, motDePasse, typeUtilisateur: role };
      if (role === 'etudiant' || role === 'diplome') {
        data.nom = nom;
        data.prenom = prenom;
        data.filiere = filiere;
        data.niveauEtude = niveauEtude;
        data.promotion = promotion;
        data.telephone = telephone;
        if (situationActuelle) data.situationActuelle = situationActuelle;
      } else {
        data.nomEntreprise = nomEntreprise;
        data.secteurActivite = secteurActivite;
        data.ville = ville;
        data.siteWeb = siteWeb;
      }
      await api.post('/auth/register', data);
      navigate('/email-envoye');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">

      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative" style={{backgroundImage: "url(/slide-5.png)", backgroundSize: "cover", backgroundPosition: "center"}}>
        <div className="absolute inset-0 bg-black/30"></div>
  <div className="flex items-center gap-3 relative z-10">
          <img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto bg-white rounded-lg p-1" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Rejoignez la<br />communauté<br />UNCHK
          </h1>
          <p className="text-white text-lg mb-10 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            Créez votre compte et accédez à toutes les opportunités professionnelles.
          </p>

          <div className="space-y-4">
            {[
              { icon: 'fa-solid fa-graduation-cap', label: 'Étudiant', desc: 'Postulez aux offres de stage et d\'emploi' },
              { icon: 'fa-solid fa-user-graduate', label: 'Diplômé', desc: 'Déclarez votre situation professionnelle post-diplôme' },
              { icon: 'fa-solid fa-building', label: 'Entreprise', desc: 'Publiez vos offres et trouvez des talents' },
            ].map((item) => (
              <div key=<i className={item.label}></i> className={`flex items-center gap-4 rounded-xl p-4 transition ${
                role === item.label.toLowerCase() ? 'bg-black/50 border border-white/40' : 'bg-black/40 border border-white/20'
              }`}>
                <span className="text-2xl"><i className={item.icon}></i></span>
                <div>
                  <p className="text-white font-semibold"><i className={item.label}></i></p>
                  <p className="text-white text-sm font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white text-sm font-medium drop-shadow-md">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-white font-medium underline">Se connecter</Link>
        </p>
      </div>

      {/* Panneau droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-10 w-auto" />
          </div>

          {/* Indicateur étapes */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>1</div>
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>2</div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span><i className="fa-solid fa-triangle-exclamation text-yellow-500"></i></span> {error}
            </div>
          )}

          {/* Étape 1 : Choix du rôle */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Créer un compte</h2>
              <p className="text-gray-500 mb-8">Choisissez votre profil pour commencer</p>

              <div className="space-y-4">
                <button onClick={() => handleSelectRole('etudiant')}
                  className="w-full border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 text-left transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-200 transition">
                      <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">Je suis étudiant</p>
                      <p className="text-gray-500 text-sm">Postulez aux offres de stage et d'emploi</p>
                    </div>
                    <span className="ml-auto text-gray-400 group-hover:text-green-500">→</span>
                  </div>
                </button>

                <button onClick={() => handleSelectRole('diplome')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${role === 'diplome' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${role === 'diplome' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <i className="fa-solid fa-user-graduate"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Je suis diplômé</p>
                    <p className="text-gray-500 text-sm">Déclarez votre situation professionnelle post-diplôme</p>
                  </div>
                  <span className="ml-auto text-gray-400">→</span>
                </button>
                <button onClick={() => handleSelectRole('entreprise')}
                  className="w-full border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 text-left transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-200 transition">
                      <i className="fa-solid fa-building"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">Je représente une entreprise</p>
                      <p className="text-gray-500 text-sm">Publiez des offres et recrutez des talents</p>
                    </div>
                    <span className="ml-auto text-gray-400 group-hover:text-green-500">→</span>
                  </div>
                </button>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          )}

          {/* Étape 2 : Formulaire */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
                <><i className="fa-solid fa-arrow-left mr-1"></i> Retour</>
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {role === 'etudiant' ? <><i className="fa-solid fa-graduation-cap"></i> Compte étudiant</> : role === 'diplome' ? <><i className="fa-solid fa-user-graduate"></i> Compte diplômé</> : <><i className="fa-solid fa-building"></i> Compte entreprise</>}
              </h2>
              <p className="text-gray-500 mb-6">Remplissez vos informations</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Champs étudiant */}
                {(role === 'etudiant' || role === 'diplome') && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                        <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required
                          placeholder="Amadou"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                        <input type="text" value={nom} onChange={e => setNom(e.target.value)} required
                          placeholder="Diallo"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Filière *</label>
                        <input type="text" value={filiere} onChange={e => setFiliere(e.target.value)} required
                          placeholder="Informatique"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Niveau *</label>
                        <select value={niveauEtude} onChange={e => setNiveauEtude(e.target.value)} required
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">Choisir</option>
                          <option value="licence">Licence</option>
                          <option value="master">Master</option>
                          
                          <option value="doctorat">Doctorat</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Promotion *</label>
                        <input type="text" value={promotion} onChange={e => setPromotion(e.target.value)} required
                          placeholder="2026"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Statut actuel *</label>
                      <select value={situationActuelle} onChange={e => setSituationActuelle(e.target.value)} required
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        {role === 'etudiant' && (
                          <>
                            <option value="en_cours_etude">En cours d'étude</option>
                            <option value="en_stage">En stage de formation</option>
                          </>
                        )}
                        {role === 'diplome' && (
                          <>
                            <option value="sous_contrat_stage">Sous contrat stage</option>
                            <option value="sous_contrat_cdd">Sous contrat CDD</option>
                            <option value="sous_contrat_cdi">Sous contrat CDI</option>
                            <option value="freelance">Freelance / Indépendant</option>
                            <option value="entrepreneur">Entrepreneur</option>
                            <option value="en_formation_continue">En formation continue</option>
                            <option value="en_recherche_emploi">En recherche d'emploi</option>
                            <option value="expatrie">Expatrié(e)</option>
                            <option value="sans_activite">Sans activité</option>
                          </>
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* Champs entreprise */}
                {role === 'entreprise' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
                      <input type="text" value={nomEntreprise} onChange={e => setNomEntreprise(e.target.value)} required
                        placeholder="Tech Dakar SARL"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Secteur *</label>
                        <input type="text" value={secteurActivite} onChange={e => setSecteurActivite(e.target.value)} required
                          placeholder="Informatique"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ville *</label>
                        <input type="text" value={ville} onChange={e => setVille(e.target.value)} required
                          placeholder="Dakar"
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Site web</label>
                      <input type="url" value={siteWeb} onChange={e => setSiteWeb(e.target.value)}
                        placeholder="https://monentreprise.com"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </>
                )}

                {/* Champs communs */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="vous@exemple.com"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={motDePasse}
                        onChange={e => setMotDePasse(e.target.value)} required placeholder="••••••••"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        {showPassword ? '🙈' : <i className="fa-solid fa-eye"></i>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer *</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      required placeholder="••••••••"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>

                {/* Acceptation politique de confidentialité — obligatoire (loi n° 2008-12) */}
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <input
                    type="checkbox"
                    id="accepteCGU"
                    checked={accepteCGU}
                    onChange={e => setAccepteCGU(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-green-600 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="accepteCGU" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                    J'ai lu et j'accepte la{' '}
                    <Link to="/politique-confidentialite" target="_blank" rel="noopener noreferrer"
                      className="text-green-700 font-semibold hover:underline">
                      politique de confidentialité
                    </Link>
                    {' '}de la plateforme UNCHK. Mes données sont traitées conformément à la loi n°&nbsp;2008-12 du Sénégal.
                  </label>
                </div>

                <button type="submit" disabled={isLoading || !accepteCGU}
                  title={!accepteCGU ? 'Veuillez accepter la politique de confidentialité' : undefined}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition mt-2">
                  {isLoading ? 'Création du compte...' : <><i className="fa-solid fa-rocket"></i> Créer mon compte</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}