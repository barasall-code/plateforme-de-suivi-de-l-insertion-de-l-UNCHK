import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as notificationsService from '../services/notifications.service';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notifications = await notificationsService.getNotifications(req.user!.userId);
    const nonLues = await notificationsService.getNombreNonLues(req.user!.userId);
    res.status(200).json({ success: true, data: { notifications, nonLues } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function marquerCommeLue(req: AuthRequest, res: Response): Promise<void> {
  try {
    await notificationsService.marquerCommeLue(req.params.id as string, req.user!.userId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function marquerToutesCommeLues(req: AuthRequest, res: Response): Promise<void> {
  try {
    await notificationsService.marquerToutesCommeLues(req.user!.userId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}