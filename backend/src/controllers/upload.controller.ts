import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import path from 'path';
import { z } from 'zod';

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  cv:      ['application/pdf'],
  photo:   ['image/jpeg', 'image/png', 'image/webp'],
  diplome: ['application/pdf'],
  document: ['application/pdf', 'application/msword',
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const TypeFichierSchema = z.enum(['cv', 'photo', 'diplome', 'document']);

export async function uploadFichier(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
      return;
    }

    const typeValidation = TypeFichierSchema.safeParse(req.body.type);
    if (!typeValidation.success) {
      res.status(400).json({ success: false, message: 'Type de fichier invalide (cv, photo, diplome, document)' });
      return;
    }
    const typeFichier = typeValidation.data;

    // Validation MIME
    const allowedMimes = ALLOWED_MIME_TYPES[typeFichier] || [];
    if (!allowedMimes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `Type MIME non autorise pour ${typeFichier}. Acceptes : ${allowedMimes.join(', ')}`,
      });
      return;
    }

    // Validation taille
    if (req.file.size > MAX_SIZE_BYTES) {
      res.status(400).json({ success: false, message: 'Fichier trop volumineux (max 5 MB)' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    if (typeFichier === 'cv') {
      await prisma.etudiant.update({
        where: { id: req.user!.userId },
        data:  { cvUrl: fileUrl },
      });
    } else if (typeFichier === 'photo') {
      await prisma.etudiant.update({
        where: { id: req.user!.userId },
        data:  { photoUrl: fileUrl },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url:          fileUrl,
        filename:     req.file.filename,
        originalname: req.file.originalname,
        size:         req.file.size,
        type:         typeFichier,
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

    const allowedMimes = ALLOWED_MIME_TYPES['document'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `Type MIME non autorise. Acceptes : ${allowedMimes.join(', ')}`,
      });
      return;
    }

    if (req.file.size > MAX_SIZE_BYTES) {
      res.status(400).json({ success: false, message: 'Fichier trop volumineux (max 5 MB)' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      data: {
        url:          fileUrl,
        filename:     req.file.filename,
        originalname: req.file.originalname,
        size:         req.file.size,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
