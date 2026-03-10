import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as adminService from '../services/admin.service';

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getEntreprises(req: AuthRequest, res: Response): Promise<void> {
  try {
    const entreprises = await adminService.getEntreprises();
    res.status(200).json({ success: true, data: entreprises });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function validerEntreprise(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.validerEntreprise(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function rejeterEntreprise(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.rejeterEntreprise(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getUtilisateurs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const utilisateurs = await adminService.getUtilisateurs();
    res.status(200).json({ success: true, data: utilisateurs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function toggleUtilisateur(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.toggleUtilisateur(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getOffresEnAttente(req: AuthRequest, res: Response): Promise<void> {
  try {
    const offres = await adminService.getOffresEnAttente();
    res.status(200).json({ success: true, data: offres });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function validerOffre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.validerOffre(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}