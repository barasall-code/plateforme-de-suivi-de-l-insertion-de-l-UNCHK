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

// ─── Superviseurs ─────────────────────────────────────────────────────────────

export async function getSuperviseurs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.getSuperviseurs();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function creerSuperviseur(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.creerSuperviseur(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function modifierSuperviseur(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.modifierSuperviseur(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function supprimerSuperviseur(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.supprimerSuperviseur(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// ─── Supervisions ─────────────────────────────────────────────────────────────

export async function getSupervisions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.getSupervisions();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function assignerSupervision(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { superviseurId, etudiantId } = req.body;
    const result = await adminService.assignerSupervision(superviseurId, etudiantId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function supprimerSupervision(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { superviseurId, etudiantId } = req.params;
    const result = await adminService.supprimerSupervision(superviseurId as string, etudiantId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getEtudiantsSansSupervision(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.getEtudiantsSansSupervision();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}