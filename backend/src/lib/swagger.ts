import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Plateforme Insertion UNCHK',
      description: `
REST API de la **Plateforme de Suivi de l'Insertion Professionnelle** de l'Université Numérique Cheikh Hamidou Kane (UNCHK).

### Authentification

L'API utilise des **JSON Web Tokens (JWT)** pour sécuriser les endpoints.
Incluez le token dans l'en-tête HTTP :

\`\`\`
Authorization: Bearer <votre_token>
\`\`\`

### Rôles disponibles
- **etudiant** — Consulter les offres, postuler, gérer son profil
- **entreprise** — Publier des offres, gérer les candidatures
- **admin** — Gérer la plateforme, valider, produire des statistiques
- **superviseur** — Suivre les étudiants supervisés

### Conformité
Cette API respecte la Loi n° 2008-12 du 25 janvier 2008 sur la Protection des Données Personnelles au Sénégal.
      `,
      version: '1.0.0',
      contact: {
        name: 'UNCHK — Support Technique',
        email: 'support@unchk.edu.sn',
      },
      license: {
        name: 'Usage interne UNCHK',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.unchk.edu.sn/api'
          : 'http://localhost:3001/api',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Développement local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via POST /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Message d\'erreur' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        Utilisateur: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            typeUtilisateur: { type: 'string', enum: ['etudiant', 'entreprise', 'admin', 'superviseur'] },
            estActif: { type: 'boolean' },
            dateCreation: { type: 'string', format: 'date-time' },
          },
        },
        Etudiant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            numeroEtudiant: { type: 'string' },
            filiere: { type: 'string' },
            niveauEtude: { type: 'string', enum: ['licence', 'master', 'master1', 'master2', 'doctorat'] },
            promotion: { type: 'string' },
            cvUrl: { type: 'string' },
            photoUrl: { type: 'string' },
          },
        },
        Offre: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            titre: { type: 'string' },
            description: { type: 'string' },
            typeOffre: { type: 'string', enum: ['stage', 'alternance', 'cdi', 'cdd', 'freelance'] },
            statut: { type: 'string', enum: ['brouillon', 'soumis', 'valide', 'publie', 'ferme'] },
            ville: { type: 'string' },
            remuneration: { type: 'number' },
            dateExpiration: { type: 'string', format: 'date-time' },
            dateCreation: { type: 'string', format: 'date-time' },
          },
        },
        Candidature: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            statut: { type: 'string', enum: ['soumise', 'vue', 'entretien', 'acceptee', 'refusee'] },
            lettreMotivation: { type: 'string' },
            dateCreation: { type: 'string', format: 'date-time' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'motDePasse'],
          properties: {
            email: { type: 'string', format: 'email', example: 'etudiant@unchk.edu.sn' },
            motDePasse: { type: 'string', minLength: 8, example: 'MonMotDePasse123!' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['email', 'motDePasse', 'typeUtilisateur'],
          properties: {
            email: { type: 'string', format: 'email' },
            motDePasse: { type: 'string', minLength: 8 },
            typeUtilisateur: { type: 'string', enum: ['etudiant', 'entreprise'] },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            nomEntreprise: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                user: { $ref: '#/components/schemas/Utilisateur' },
              },
            },
          },
        },
        AdminStats: {
          type: 'object',
          properties: {
            totalEtudiants: { type: 'integer' },
            totalEntreprises: { type: 'integer' },
            totalOffres: { type: 'integer' },
            totalCandidatures: { type: 'integer' },
            entreprisesEnAttente: { type: 'integer' },
            offresPubliees: { type: 'integer' },
            candidaturesAcceptees: { type: 'integer' },
            tauxInsertion: { type: 'number', description: 'Taux d\'insertion en pourcentage' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Non authentifié — token JWT manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Accès refusé — rôle insuffisant',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Ressource introuvable',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion des sessions' },
      { name: 'Offres', description: 'Offres de stage et d\'emploi' },
      { name: 'Candidatures', description: 'Gestion des candidatures' },
      { name: 'Profil', description: 'Profil étudiant' },
      { name: 'Entreprise', description: 'Espace entreprise' },
      { name: 'Admin', description: 'Administration de la plateforme' },
      { name: 'Superviseur', description: 'Supervision pédagogique' },
      { name: 'Messagerie', description: 'Messagerie interne' },
      { name: 'Notifications', description: 'Système de notifications' },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
