import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as offresService from '../services/offres.service';

export async function getOffres(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.getOffres(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getOffreById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.getOffreById(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createOffre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.createOffre(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateOffre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.updateOffre(req.params.id as string, req.body, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteOffre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.deleteOffre(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function validerOffre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.validerOffre(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMesOffres(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await offresService.getMesOffres(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}