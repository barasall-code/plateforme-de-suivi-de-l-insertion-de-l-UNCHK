import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as candidaturesService from '../services/candidatures.service';

export async function postuler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await candidaturesService.postuler(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMesCandidatures(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await candidaturesService.getMesCandidatures(req.user!.userId);
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
    const result = await candidaturesService.retirerCandidature(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}