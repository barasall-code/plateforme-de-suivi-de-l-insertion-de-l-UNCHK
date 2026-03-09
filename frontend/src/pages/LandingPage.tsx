import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <img src="/logo_unchk.png" alt="UNCHK" className="h-10 w-auto" />
          <div className="flex items-center gap-4">            <Link to="/login" className="text-sm text-gray-600 hover:text-green-700 font-medium transition">
              Se connecter
            </Link>
            <Link to="/register"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 relative" style={{backgroundImage: "url(/image_de_fond_unchk.jpeg)", backgroundSize: "cover", backgroundPosition: "center"}}>
        <div className="absolute inset-0 bg-green-900/40"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🎓 Université Numérique Cheikh Hamidou Kane
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Votre insertion<br />
            <span className="text-green-300">professionnelle</span><br />
            commence ici
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            La plateforme qui connecte les étudiants de l'UNCHK aux meilleures opportunités de stage et d'emploi au Sénégal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-green-200 text-lg">
              Commencer gratuitement →
            </Link>
            <Link to="/login"
              className="border border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition text-lg">
              Se connecter
            </Link>
          </div>
          <p className="text-green-200 text-sm mt-6">
            Déjà plus de 3 étudiants et 1 entreprise sur la plateforme
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Taux d\'insertion', color: 'text-green-600' },
              { value: '3+', label: 'Étudiants actifs', color: 'text-blue-600' },
              { value: '1+', label: 'Entreprises partenaires', color: 'text-purple-600' },
              { value: '4', label: 'Rôles disponibles', color: 'text-orange-500' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une plateforme complète pour gérer l'ensemble du processus d'insertion professionnelle</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Offres de stage & emploi', desc: 'Consultez des centaines d\'offres filtrées par domaine, type, niveau et salaire. Postulez en quelques clics.', color: 'bg-blue-50' },
              { icon: '📝', title: 'Suivi des candidatures', desc: 'Suivez en temps réel l\'état de vos candidatures. Recevez des notifications à chaque changement de statut.', color: 'bg-green-50' },
              { icon: '🔔', title: 'Notifications temps réel', desc: 'Soyez alerté instantanément quand votre candidature est consultée, acceptée ou qu\'un entretien est planifié.', color: 'bg-yellow-50' },
              { icon: '👤', title: 'Profil complet', desc: 'Créez votre profil avec vos compétences, votre CV et vos informations académiques pour vous démarquer.', color: 'bg-purple-50' },
              { icon: '🏢', title: 'Espace entreprise', desc: 'Publiez vos offres, gérez vos candidatures et trouvez les talents de l\'UNCHK qui correspondent à vos besoins.', color: 'bg-orange-50' },
              { icon: '📊', title: 'Tableau de bord admin', desc: 'Supervisez l\'ensemble des activités, validez les entreprises et suivez les statistiques d\'insertion.', color: 'bg-red-50' },
            ].map((feature) => (
              <div key={feature.title} className={`${feature.color} rounded-2xl p-6 hover:shadow-md transition`}>
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rôles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Une plateforme pour tous</h2>
            <p className="text-gray-500">Chaque acteur dispose d'un espace dédié et adapté à ses besoins</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎓', role: 'Étudiant', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700',
                features: ['Consulter les offres', 'Postuler en ligne', 'Suivre ses candidatures', 'Gérer son profil', 'Recevoir des alertes'] },
              { icon: '🏢', role: 'Entreprise', color: 'border-green-200 bg-green-50', badge: 'bg-white/20 text-white',
                features: ['Publier des offres', 'Gérer les candidatures', 'Voir les profils', 'Valider les statuts', 'Tableau de bord'] },
              { icon: '⚙️', role: 'Admin', color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700',
                features: ['Valider les entreprises', 'Gérer les utilisateurs', 'Consulter les stats', 'Modérer la plateforme'] },
              { icon: '👁️', role: 'Superviseur', color: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700',
                features: ['Suivre les étudiants', 'Voir les candidatures', 'Ajouter des commentaires', 'Taux d\'insertion'] },
            ].map((item) => (
              <div key={item.role} className={`border ${item.color} rounded-2xl p-6`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${item.badge}`}>
                  {item.role}
                </span>
                <ul className="space-y-2">
                  {item.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-gradient-to-br from-green-700 to-emerald-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à démarrer votre parcours ?
          </h2>
          <p className="text-green-200 mb-8 text-lg">
            Rejoignez la plateforme de l'UNCHK et accélérez votre insertion professionnelle dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-white text-green-700 hover:bg-green-50 font-semibold px-8 py-4 rounded-xl transition text-lg">
              Créer mon compte →
            </Link>
            <Link to="/login"
              className="border border-green-400 text-white hover:bg-green-600 font-semibold px-8 py-4 rounded-xl transition text-lg">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Galerie */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">La vie à l'UNCHK</h2>
            <p className="text-gray-500 text-lg">Découvrez notre campus et notre communauté</p>
          </div>
          <div className="grid grid-cols-4 grid-rows-2 gap-4" style={{height: '480px'}}>
            <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_campus2.jpeg" alt="Campus UNCHK" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_etudiants1.jpeg" alt="Etudiants" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_graduation.jpeg" alt="Graduation" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_etudiants3.jpeg" alt="Etudiants" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_campus3.jpeg" alt="Campus" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4" style={{height: '200px'}}>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_etudiants.jpeg" alt="Etudiants" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_parrain.jpeg" alt="Parrain" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
            <div className="overflow-hidden rounded-2xl shadow-lg"><img src="/galerie_campus3.jpeg" alt="Campus" className="w-full h-full object-cover hover:scale-105 transition duration-500" /></div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo2_unchk.png" alt="UNCHK" className="h-8 w-auto bg-white rounded-lg p-1" />
          </div>
          <p className="text-sm">© 2026 Université Numérique Cheikh Hamidou Kane — Tous droits réservés</p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="hover:text-white transition">Connexion</Link>
            <Link to="/register" className="hover:text-white transition">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}