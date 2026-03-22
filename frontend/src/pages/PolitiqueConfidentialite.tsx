import { Link } from 'react-router-dom';

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <img src="/logo_unchk.png" alt="UNCHK" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-600 hover:text-green-700 font-medium transition">
              Se connecter
            </Link>
            <Link to="/register"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔒</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
              <p className="text-gray-500 text-sm mt-1">Dernière mise à jour : 1er janvier 2026</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
            <p className="text-green-800 text-sm leading-relaxed">
              <strong>Conformité légale :</strong> La présente politique de confidentialité est établie conformément à la{' '}
              <strong>Loi n° 2008-12 du 25 janvier 2008</strong> sur la Protection des Données à Caractère Personnel
              au Sénégal, ainsi qu'aux recommandations de la{' '}
              <strong>Commission de Protection des Données Personnelles (CDP)</strong>.
            </p>
          </div>
        </div>

        {/* Table des matières */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sommaire</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { num: '1', title: 'Responsable du traitement' },
              { num: '2', title: 'Données collectées' },
              { num: '3', title: 'Finalités du traitement' },
              { num: '4', title: 'Base légale du traitement' },
              { num: '5', title: 'Durée de conservation' },
              { num: '6', title: 'Destinataires des données' },
              { num: '7', title: 'Droits des personnes concernées' },
              { num: '8', title: 'Sécurité des données' },
              { num: '9', title: 'Cookies et traceurs' },
              { num: '10', title: 'Modifications de la politique' },
              { num: '11', title: 'Contact et réclamation' },
            ].map(item => (
              <a key={item.num} href={`#section-${item.num}`}
                className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 hover:underline py-1">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.num}
                </span>
                {item.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-6">

          {/* Section 1 */}
          <section id="section-1" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center">1</span>
              Responsable du Traitement
            </h2>
            <div className="prose prose-gray max-w-none text-sm leading-relaxed">
              <p className="text-gray-600 mb-3">
                Le responsable du traitement des données à caractère personnel collectées via la plateforme de suivi
                de l'insertion professionnelle est :
              </p>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">Dénomination</p>
                  <p className="text-gray-600">Université Numérique Cheikh Hamidou Kane (UNCHK)</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Statut juridique</p>
                  <p className="text-gray-600">Établissement public à caractère scientifique et technologique</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Siège social</p>
                  <p className="text-gray-600">Dakar, Sénégal</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Contact DPO</p>
                  <p className="text-gray-600">dpo@unchk.edu.sn</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">2</span>
              Données Collectées
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Dans le cadre de vos interactions avec la plateforme, nous collectons les catégories de données suivantes :
            </p>
            <div className="space-y-4">
              {[
                {
                  role: '🎓 Étudiants',
                  color: 'blue',
                  items: [
                    'Informations d\'identité : nom, prénom, date de naissance, numéro étudiant',
                    'Coordonnées : adresse e-mail, numéro de téléphone',
                    'Données académiques : filière, niveau d\'étude, promotion, date de diplôme',
                    'Documents : CV (format PDF/Word), photo de profil',
                    'Données professionnelles : compétences, situation professionnelle, URL LinkedIn',
                    'Données de navigation : historique des candidatures, préférences',
                  ]
                },
                {
                  role: '🏢 Entreprises',
                  color: 'green',
                  items: [
                    'Informations d\'identification : raison sociale, SIRET/NINEA',
                    'Coordonnées : e-mail, site web, ville, pays',
                    'Données professionnelles : secteur d\'activité, taille, description',
                    'Logo et identité visuelle de l\'entreprise',
                  ]
                },
                {
                  role: '👁️ Superviseurs',
                  color: 'purple',
                  items: [
                    'Identité : nom, prénom, département de rattachement',
                    'Coordonnées : adresse e-mail, téléphone professionnel',
                    'Données de supervision : liste des étudiants supervisés, commentaires pédagogiques',
                  ]
                },
              ].map(cat => (
                <div key={cat.role} className={`border border-${cat.color}-200 rounded-xl p-4`}>
                  <h3 className="font-semibold text-gray-800 mb-2">{cat.role}</h3>
                  <ul className="space-y-1">
                    {cat.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold flex items-center justify-center">3</span>
              Finalités du Traitement
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Vos données sont traitées exclusivement pour les finalités suivantes, conformément à l'article 18 de la loi 2008-12 :
            </p>
            <div className="space-y-3">
              {[
                { icon: '✅', title: 'Gestion des comptes utilisateurs', desc: 'Création, authentification, sécurisation et administration des comptes sur la plateforme.' },
                { icon: '📋', title: 'Mise en relation stage/emploi', desc: 'Permettre aux étudiants de candidater aux offres et aux entreprises de recevoir les candidatures.' },
                { icon: '📊', title: 'Suivi de l\'insertion professionnelle', desc: 'Produire des statistiques agrégées et anonymisées sur l\'insertion des diplômés de l\'UNCHK.' },
                { icon: '🔔', title: 'Notifications et communications', desc: 'Envoyer des alertes relatives à l\'état des candidatures, des offres et des activités de la plateforme.' },
                { icon: '👁️', title: 'Supervision pédagogique', desc: 'Permettre aux superviseurs de suivre le parcours d\'insertion de leurs étudiants.' },
                { icon: '⚙️', title: 'Administration et sécurité', desc: 'Modération de la plateforme, détection des fraudes et audit de sécurité.' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{f.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center">4</span>
              Base Légale du Traitement
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Conformément à l'article 27 de la loi n° 2008-12, le traitement de vos données repose sur les bases légales suivantes :
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-4 bg-green-50 py-3 pr-3 rounded-r-lg">
                <p className="font-semibold text-green-800 text-sm">Consentement (art. 27-1)</p>
                <p className="text-green-700 text-xs mt-1">
                  En créant votre compte et en cochant la case d'acceptation lors de l'inscription, vous consentez
                  expressément au traitement de vos données personnelles pour les finalités décrites.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 py-3 pr-3 rounded-r-lg">
                <p className="font-semibold text-blue-800 text-sm">Exécution d'un contrat (art. 27-2)</p>
                <p className="text-blue-700 text-xs mt-1">
                  Le traitement est nécessaire à l'exécution des services de la plateforme auxquels vous vous êtes inscrit(e).
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 py-3 pr-3 rounded-r-lg">
                <p className="font-semibold text-purple-800 text-sm">Mission d'intérêt public (art. 27-4)</p>
                <p className="text-purple-700 text-xs mt-1">
                  Dans le cadre de la mission de service public de l'UNCHK, le traitement statistique des données
                  d'insertion est réalisé dans l'intérêt général de l'enseignement supérieur sénégalais.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center justify-center">5</span>
              Durée de Conservation
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Conformément au principe de limitation de la durée de conservation (art. 28 loi 2008-12) :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 rounded-xl">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-l-lg">Catégorie de données</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Durée active</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-r-lg">Durée archive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Compte étudiant actif', 'Durée des études + 2 ans', '5 ans (statistiques anonymisées)'],
                    ['CV et documents téléversés', 'Durée d\'utilisation active', '1 an après désactivation du compte'],
                    ['Historique des candidatures', 'Durée d\'utilisation active', '3 ans après désactivation'],
                    ['Comptes entreprises', 'Durée de partenariat', '3 ans après fin de partenariat'],
                    ['Logs de sécurité', 'En temps réel', '12 mois (obligation légale)'],
                    ['Tokens d\'authentification', 'Durée de session (7 jours)', 'Non conservés'],
                    ['E-mails de vérification', '24 heures', 'Supprimés automatiquement'],
                  ].map(([cat, duree, archive]) => (
                    <tr key={cat} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">{cat}</td>
                      <td className="px-4 py-3 text-gray-600">{duree}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{archive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">6</span>
              Destinataires des Données
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Vos données personnelles sont accessibles uniquement aux destinataires suivants, dans le strict cadre de leurs attributions :
            </p>
            <div className="space-y-3">
              {[
                { dest: 'Personnel administratif UNCHK (Admins)', access: 'Accès complet pour la gestion de la plateforme et la modération' },
                { dest: 'Superviseurs pédagogiques', access: 'Accès aux données des étudiants qu\'ils supervisent uniquement' },
                { dest: 'Entreprises partenaires validées', access: 'Accès au profil public, CV et compétences des étudiants candidats uniquement' },
                { dest: 'Prestataires techniques (hébergement)', access: 'Accès technique encadré par des contrats de confidentialité' },
              ].map(d => (
                <div key={d.dest} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 mt-1 flex-shrink-0">👤</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{d.dest}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{d.access}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Transferts internationaux :</strong> Aucun transfert de données personnelles n'est effectué vers des pays
                tiers sans garanties adéquates conformément à l'article 47 de la loi 2008-12.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center">7</span>
              Vos Droits
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Conformément aux articles 43 à 53 de la loi n° 2008-12 et aux Chapitres IV et V de la loi, vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: '👁️', right: 'Droit d\'accès (art. 43)',
                  desc: 'Vous pouvez obtenir confirmation que des données vous concernant sont traitées et en obtenir une copie.'
                },
                {
                  icon: '✏️', right: 'Droit de rectification (art. 44)',
                  desc: 'Vous pouvez demander la correction de vos données inexactes ou incomplètes depuis votre profil.'
                },
                {
                  icon: '🗑️', right: 'Droit à l\'effacement (art. 45)',
                  desc: 'Vous pouvez demander la suppression de vos données dans les cas prévus par la loi.'
                },
                {
                  icon: '⛔', right: 'Droit d\'opposition (art. 46)',
                  desc: 'Vous pouvez vous opposer au traitement de vos données pour des motifs légitimes.'
                },
                {
                  icon: '🔒', right: 'Droit à la limitation (art. 47)',
                  desc: 'Vous pouvez demander la suspension temporaire du traitement de vos données.'
                },
                {
                  icon: '📦', right: 'Droit à la portabilité',
                  desc: 'Vous pouvez recevoir vos données dans un format structuré et lisible par machine.'
                },
              ].map(r => (
                <div key={r.right} className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{r.icon}</span>
                    <h3 className="font-semibold text-gray-800 text-sm">{r.right}</h3>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm">
                <strong>📬 Pour exercer vos droits :</strong> Envoyez votre demande par e-mail à{' '}
                <a href="mailto:dpo@unchk.edu.sn" className="underline font-medium">dpo@unchk.edu.sn</a>
                {' '}avec une pièce d'identité. Nous répondrons sous <strong>30 jours ouvrables</strong> conformément à la loi.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center">8</span>
              Sécurité des Données
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Conformément à l'article 70 de la loi 2008-12, nous mettons en œuvre les mesures techniques et organisationnelles suivantes :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '🔐', measure: 'Chiffrement des mots de passe', detail: 'Hachage bcrypt (12 rounds) — aucun mot de passe en clair' },
                { icon: '🛡️', measure: 'Authentification JWT sécurisée', detail: 'Tokens signés, expiration automatique, refresh tokens rotatifs' },
                { icon: '🌐', measure: 'Transport chiffré (HTTPS/TLS)', detail: 'Toutes les communications sont chiffrées en transit' },
                { icon: '🏗️', measure: 'Headers de sécurité HTTP', detail: 'Helmet.js : CSP, HSTS, X-Frame-Options, XSS Protection' },
                { icon: '🚧', measure: 'Protection CORS stricte', detail: 'Origines autorisées explicitement configurées' },
                { icon: '📋', measure: 'Journaux d\'audit', detail: 'Enregistrement des actions sensibles pour détection d\'incidents' },
                { icon: '🔍', measure: 'Validation des entrées', detail: 'Zod schema validation côté serveur — protection injection' },
                { icon: '⏱️', measure: 'Rate limiting', detail: 'Limitation du nombre de requêtes pour prévenir les attaques' },
              ].map(m => (
                <div key={m.measure} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl flex-shrink-0">{m.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{m.measure}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">9</span>
              Cookies et Traceurs
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Notre plateforme utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service :
            </p>
            <div className="space-y-3">
              {[
                {
                  name: 'Token d\'authentification (localStorage)',
                  purpose: 'Maintien de la session utilisateur',
                  duration: 'Durée de la session (7 jours max)',
                  essential: true
                },
                {
                  name: 'Préférences utilisateur',
                  purpose: 'Mémorisation des préférences d\'affichage',
                  duration: '30 jours',
                  essential: true
                },
              ].map(c => (
                <div key={c.name} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                    <p className="text-gray-500 text-xs mt-1 mb-1">{c.purpose}</p>
                    <p className="text-gray-400 text-xs">Durée : {c.duration}</p>
                  </div>
                  {c.essential && (
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      Essentiel
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Nous n'utilisons aucun cookie publicitaire, de pistage ou d'analyse comportementale.
            </p>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center">10</span>
              Modifications de la Politique
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment.
              Toute modification substantielle sera notifiée par e-mail aux utilisateurs actifs <strong>au moins 15 jours avant</strong> son entrée en vigueur.
              La date de dernière mise à jour figurant en haut de ce document sera systématiquement mise à jour.
            </p>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              En continuant à utiliser la plateforme après notification des modifications, vous acceptez la nouvelle politique.
            </p>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">11</span>
              Contact et Réclamation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">📬 Délégué à la Protection des Données (DPO)</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 <a href="mailto:dpo@unchk.edu.sn" className="text-green-700 hover:underline">dpo@unchk.edu.sn</a></p>
                  <p>🏛️ Service juridique — UNCHK, Dakar, Sénégal</p>
                  <p>⏱️ Délai de réponse : 30 jours ouvrables</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">🏛️ Autorité de contrôle</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-700">Commission de Protection des Données Personnelles (CDP)</p>
                  <p>📧 <a href="mailto:cdp@justice.sn" className="text-blue-700 hover:underline">cdp@justice.sn</a></p>
                  <p>🌐 <a href="https://cdp.sn" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">cdp.sn</a></p>
                  <p className="text-gray-500 text-xs mt-2">
                    Vous avez le droit de déposer une plainte auprès de la CDP si vous estimez que vos droits ne sont pas respectés.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer de page */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs">
            © 2026 Université Numérique Cheikh Hamidou Kane — Politique de confidentialité conforme à la Loi n° 2008-12
          </p>
          <div className="flex justify-center gap-6 mt-3">
            <Link to="/" className="text-sm text-green-700 hover:underline">← Retour à l'accueil</Link>
            <Link to="/login" className="text-sm text-green-700 hover:underline">Se connecter</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
