import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as profilService from '../services/profil.service';

export async function getProfil(req: AuthRequest, res: Response): Promise<void> {
  try {
    let profil;
    if (req.user!.role === 'etudiant') {
      profil = await profilService.getProfilEtudiant(req.user!.userId);
    } else if (req.user!.role === 'entreprise') {
      profil = await profilService.getProfilEntreprise(req.user!.userId);
    } else {
      res.status(400).json({ success: false, message: 'Role non supporte' });
      return;
    }
    res.status(200).json({ success: true, data: profil });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function updateProfil(req: AuthRequest, res: Response): Promise<void> {
  try {
    let profil;
    if (req.user!.role === 'etudiant') {
      profil = await profilService.updateProfilEtudiant(req.user!.userId, req.body);
    } else if (req.user!.role === 'entreprise') {
      profil = await profilService.updateProfilEntreprise(req.user!.userId, req.body);
    } else {
      res.status(400).json({ success: false, message: 'Role non supporte' });
      return;
    }
    res.status(200).json({ success: true, data: profil });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}