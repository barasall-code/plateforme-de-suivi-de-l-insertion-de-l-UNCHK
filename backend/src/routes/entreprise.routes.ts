import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/entreprise/profils-candidats — Recherche multicritères de profils
router.get('/profils-candidats', authenticate, authorize('entreprise'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filiere, niveau, competence, page = '1', limit = '12' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      utilisateur: { estActif: true, typeUtilisateur: { in: ['etudiant', 'diplome'] } },
    };
    if (filiere) where.filiere = { contains: filiere, mode: 'insensitive' };
    if (niveau) where.niveauEtude = niveau;
    if (competence) where.competences = {
      some: { competence: { nom: { contains: competence, mode: 'insensitive' } } }
    };

    const [profils, total] = await Promise.all([
      prisma.etudiant.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          utilisateur: { select: { id: true, typeUtilisateur: true, estActif: true } },
          competences: { include: { competence: true }, take: 5 },
        },
        orderBy: { nom: 'asc' },
      }),
      prisma.etudiant.count({ where }),
    ]);

    res.json({ success: true, data: { profils, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/entreprise/stats — Statistiques entreprise
router.get('/stats', authenticate, authorize('entreprise'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entreprise = await prisma.entreprise.findFirst({
      where: { utilisateur: { id: req.user!.userId } }
    });
    if (!entreprise) { res.json({ success: true, data: {} }); return; }

    const [totalOffres, totalCandidatures, recrutements] = await Promise.all([
      prisma.offre.count({ where: { entrepriseId: entreprise.id } }),
      prisma.candidature.count({ where: { offre: { entrepriseId: entreprise.id } } }),
      prisma.candidature.count({ where: { offre: { entrepriseId: entreprise.id }, statut: 'acceptee' } }),
    ]);

    res.json({ success: true, data: { totalOffres, totalCandidatures, recrutements, profilsConsultes: 0 } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
