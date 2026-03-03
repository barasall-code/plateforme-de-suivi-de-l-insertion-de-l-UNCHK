import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export async function uploadFichier(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const typeFichier = req.body.type; // 'cv', 'lettre_motivation', 'diplome'

    // Mettre à jour le profil étudiant selon le type
    if (typeFichier === 'cv') {
      await prisma.etudiant.update({
        where: { id: req.user!.userId },
        data: { cvUrl: fileUrl },
      });
    } else if (typeFichier === 'photo') {
      await prisma.etudiant.update({
        where: { id: req.user!.userId },
        data: { photoUrl: fileUrl },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        type: typeFichier,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function uploadDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}