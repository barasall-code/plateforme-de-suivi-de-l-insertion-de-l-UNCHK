import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as superviseurService from '../services/superviseur.service';

export async function getProfilSuperviseur(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await superviseurService.getProfilSuperviseur(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMesEtudiants(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await superviseurService.getMesEtudiants(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getDetailEtudiant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const etudiantId = String(req.params.etudiantId);
    const result = await superviseurService.getDetailEtudiant(etudiantId, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function ajouterCommentaire(req: AuthRequest, res: Response): Promise<void> {
  try {
    const etudiantId = String(req.params.etudiantId);
    const result = await superviseurService.ajouterCommentaire(
      etudiantId,
      req.user!.userId,
      req.body.commentaire
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getStatsSuperviseur(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await superviseurService.getStatsSuperviseur(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}