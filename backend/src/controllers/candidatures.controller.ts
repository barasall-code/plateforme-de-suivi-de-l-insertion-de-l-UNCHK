import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as candidaturesService from '../services/candidatures.service';
import { prisma } from '../lib/prisma';

// Résoudre etudiantId depuis userId (etudiant ET diplome)
async function resolveEtudiantId(userId: string): Promise<string> {
  const etudiant = await prisma.etudiant.findFirst({ where: { utilisateur: { id: userId } } });
  if (!etudiant) throw new Error('Profil étudiant introuvable');
  return etudiant.id;
}

export async function postuler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const etudiantId = await resolveEtudiantId(req.user!.userId);
    const result = await candidaturesService.postuler(req.body, etudiantId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMesCandidatures(req: AuthRequest, res: Response): Promise<void> {
  try {
    const etudiantId = await resolveEtudiantId(req.user!.userId);
    const result = await candidaturesService.getMesCandidatures(etudiantId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getCandidaturesOffre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await candidaturesService.getCandidaturesOffre(req.params.offreId as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getToutesCandidatures(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await candidaturesService.getAllCandidaturesEntreprise(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function changerStatut(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await candidaturesService.changerStatut(req.params.id as string, req.body, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function retirerCandidature(req: AuthRequest, res: Response): Promise<void> {
  try {
    const etudiantId = await resolveEtudiantId(req.user!.userId);
    const result = await candidaturesService.retirerCandidature(req.params.id as string, etudiantId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getProfilCandidat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await candidaturesService.getProfilCandidat(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}
