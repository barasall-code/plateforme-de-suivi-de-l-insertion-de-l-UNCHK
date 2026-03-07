import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as messagerieService from '../services/messagerie.service';

export async function getOuCreerConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { etudiantId, entrepriseId } = req.body;
    const result = await messagerieService.getOuCreerConversation(etudiantId, entrepriseId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMesConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await messagerieService.getMesConversations(req.user!.userId, req.user!.role);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await messagerieService.getMessages(
      String(req.params.conversationId),
      req.user!.userId
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function envoyerMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await messagerieService.envoyerMessage(
      String(req.params.conversationId),
      req.user!.userId,
      req.body.contenu
    );
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getNombreMsgNonLus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const count = await messagerieService.getNombreMsgNonLus(req.user!.userId);
    res.status(200).json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}