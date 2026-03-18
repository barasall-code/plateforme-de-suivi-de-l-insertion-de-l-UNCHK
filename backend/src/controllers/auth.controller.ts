import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const RegisterSchema = z.object({
  email:           z.string().email('Email invalide'),
  motDePasse:      z.string().min(8, 'Minimum 8 caracteres').max(100),
  typeUtilisateur: z.enum(['etudiant', 'entreprise', 'admin', 'superviseur']),
  nom:             z.string().min(1).optional(),
  prenom:          z.string().min(1).optional(),
  filiere:         z.string().optional(),
  niveauEtude:     z.string().optional(),
  promotion:       z.string().optional(),
  telephone:       z.string().optional(),
  numeroEtudiant:  z.string().optional(),
  nomEntreprise:   z.string().optional(),
  secteurActivite: z.string().optional(),
  ville:           z.string().optional(),
  siteWeb:         z.string().optional(),
});

const LoginSchema = z.object({
  email:      z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

export async function register(req: Request, res: Response): Promise<void> {
  const validation = RegisterSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(422).json({ success: false, errors: validation.error.flatten().fieldErrors });
    return;
  }
  try {
    const result = await authService.register(validation.data as any);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const validation = LoginSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(422).json({ success: false, errors: validation.error.flatten().fieldErrors });
    return;
  }
  try {
    const result = await authService.login(validation.data);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token manquant' });
      return;
    }
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && req.user) {
      await authService.logout(req.user.userId, refreshToken);
    }
    res.status(200).json({ success: true, message: 'Deconnexion reussie' });
  } catch {
    res.status(200).json({ success: true, message: 'Deconnexion reussie' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  res.status(200).json({ success: true, data: req.user });
}
