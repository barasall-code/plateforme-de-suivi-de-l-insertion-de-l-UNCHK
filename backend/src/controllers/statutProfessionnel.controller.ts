import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as service from '../services/statutProfessionnel.service';

export async function getMesStatuts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.getMesStatuts(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function declarer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.declarer(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function modifier(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.modifier(req.params.id as string, req.user!.userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function supprimer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.supprimer(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getStatutsParEtudiant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.getStatutsParEtudiant(req.params.etudiantId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function validerStatut(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.validerStatut(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
