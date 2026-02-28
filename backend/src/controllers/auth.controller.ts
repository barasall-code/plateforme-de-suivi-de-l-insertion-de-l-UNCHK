import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
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

export async function logout(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: 'Deconnexion reussie' });
}

export async function me(req: any, res: Response): Promise<void> {
  res.status(200).json({ success: true, data: req.user });
}