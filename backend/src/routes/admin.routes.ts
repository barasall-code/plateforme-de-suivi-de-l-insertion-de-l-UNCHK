import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Statistiques globales de la plateforme
 *     description: Totaux étudiants, entreprises, offres, candidatures, taux d'insertion. Réponse mise en cache 5 minutes.
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Statistiques globales
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats',          authenticate, authorize('admin'), cacheMiddleware(300), adminController.getStats);

/**
 * @swagger
 * /admin/stats/avancees:
 *   get:
 *     summary: Statistiques avancées avec filtres
 *     description: Statistiques détaillées par filiere, niveau, mois, secteur, entonnoir de conversion.
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: annee
 *         schema: { type: integer }
 *       - in: query
 *         name: filiere
 *         schema: { type: string }
 *       - in: query
 *         name: niveauEtude
 *         schema: { type: string }
 *       - in: query
 *         name: typeOffre
 *         schema: { type: string }
 *       - in: query
 *         name: secteurActivite
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Statistiques avancées
 */
router.get('/stats/avancees', authenticate, authorize('admin'), cacheMiddleware(300), adminController.getStatsAvancees);

/**
 * @swagger
 * /admin/entreprises:
 *   get:
 *     summary: Toutes les entreprises (admin)
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des entreprises avec statut de validation
 */
router.get('/entreprises', authenticate, authorize('admin'), adminController.getEntreprises);

/**
 * @swagger
 * /admin/entreprises/{id}/valider:
 *   put:
 *     summary: Valider une entreprise
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Entreprise validée
 */
router.put('/entreprises/:id/valider', authenticate, authorize('admin'), adminController.validerEntreprise);

/**
 * @swagger
 * /admin/entreprises/{id}/rejeter:
 *   put:
 *     summary: Rejeter une entreprise
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Entreprise rejetée
 */
router.put('/entreprises/:id/rejeter', authenticate, authorize('admin'), adminController.rejeterEntreprise);

/**
 * @swagger
 * /admin/utilisateurs:
 *   get:
 *     summary: Tous les utilisateurs (admin)
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 100 }
 *     responses:
 *       200:
 *         description: Liste paginee des utilisateurs
 */
router.get('/utilisateurs', authenticate, authorize('admin'), adminController.getUtilisateurs);

/**
 * @swagger
 * /admin/utilisateurs/{id}/toggle:
 *   put:
 *     summary: Activer / Désactiver un compte utilisateur
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: État du compte inversé
 */
router.put('/utilisateurs/:id/toggle', authenticate, authorize('admin'), adminController.toggleUtilisateur);

/**
 * @swagger
 * /admin/offres-en-attente:
 *   get:
 *     summary: Offres soumises en attente de validation
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des offres à valider
 */
router.get('/offres-en-attente', authenticate, authorize('admin'), adminController.getOffresEnAttente);

/**
 * @swagger
 * /admin/offres/{id}/valider:
 *   put:
 *     summary: Valider et publier une offre
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Offre publiée
 */
router.put('/offres/:id/valider', authenticate, authorize('admin'), adminController.validerOffre);

// ─── Superviseurs ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/superviseurs:
 *   get:
 *     summary: Liste des superviseurs
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Superviseurs avec nombre de supervisés
 */
router.get('/superviseurs', authenticate, authorize('admin'), adminController.getSuperviseurs);

/**
 * @swagger
 * /admin/superviseurs:
 *   post:
 *     summary: Créer un compte superviseur
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasse, nom, prenom]
 *             properties:
 *               email: { type: string, format: email }
 *               motDePasse: { type: string, minLength: 8 }
 *               nom: { type: string }
 *               prenom: { type: string }
 *               departement: { type: string }
 *               telephone: { type: string }
 *     responses:
 *       201:
 *         description: Superviseur créé
 */
router.post('/superviseurs', authenticate, authorize('admin'), adminController.creerSuperviseur);

/**
 * @swagger
 * /admin/superviseurs/{id}:
 *   put:
 *     summary: Modifier un superviseur
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Superviseur mis à jour
 */
router.put('/superviseurs/:id', authenticate, authorize('admin'), adminController.modifierSuperviseur);

/**
 * @swagger
 * /admin/superviseurs/{id}:
 *   delete:
 *     summary: Supprimer un superviseur
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Superviseur supprimé
 */
router.delete('/superviseurs/:id', authenticate, authorize('admin'), adminController.supprimerSuperviseur);

// ─── Supervisions ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/supervisions:
 *   get:
 *     summary: Toutes les supervisions
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Supervisions avec détail superviseur et étudiant
 */
router.get('/supervisions', authenticate, authorize('admin'), adminController.getSupervisions);

/**
 * @swagger
 * /admin/supervisions/etudiants-sans-supervision:
 *   get:
 *     summary: Étudiants sans superviseur assigné
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Étudiants non supervisés
 */
router.get('/supervisions/etudiants-sans-supervision', authenticate, authorize('admin'), adminController.getEtudiantsSansSupervision);

/**
 * @swagger
 * /admin/supervisions:
 *   post:
 *     summary: Assigner un superviseur à un étudiant
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [superviseurId, etudiantId]
 *             properties:
 *               superviseurId: { type: string, format: uuid }
 *               etudiantId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Supervision créée
 */
router.post('/supervisions', authenticate, authorize('admin'), adminController.assignerSupervision);

/**
 * @swagger
 * /admin/supervisions/{superviseurId}/{etudiantId}:
 *   delete:
 *     summary: Supprimer une supervision
 *     tags: [Administration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: superviseurId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: etudiantId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supervision supprimée
 */
router.delete('/supervisions/:superviseurId/:etudiantId', authenticate, authorize('admin'), adminController.supprimerSupervision);

// Marquer un étudiant comme diplômé
router.put('/utilisateurs/:id/diplomer', authenticate, authorize('admin'), adminController.marquerDiplome);

// Non-répondants et relance
router.get('/diplomes/non-repondants', authenticate, authorize('admin'), adminController.getNonRepondants);
router.post('/diplomes/relancer', authenticate, authorize('admin'), adminController.relancerDiplomes);

// Flag déclaration douteuse
router.put('/statuts/:id/signaler', authenticate, authorize('admin'), adminController.signalerStatut);
router.put('/statuts/:id/valider', authenticate, authorize('admin'), adminController.validerStatut);

export default router;
