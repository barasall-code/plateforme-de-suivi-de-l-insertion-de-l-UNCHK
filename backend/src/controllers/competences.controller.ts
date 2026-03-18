import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as service from '../services/competences.service';

export async function getAllCompetences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.getAllCompetences();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function createCompetence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.createCompetence(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMesCompetences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.getMesCompetences(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function ajouterCompetence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.ajouterCompetence(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function modifierNiveau(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.modifierNiveau(
      req.user!.userId,
      req.params.competenceId as string,
      req.body.niveauMaitrise,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function supprimerCompetence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await service.supprimerCompetence(
      req.user!.userId,
      req.params.competenceId as string,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
