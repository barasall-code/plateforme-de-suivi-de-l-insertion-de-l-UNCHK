import multer from 'multer';
import path from 'path';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no official @types package for multer-storage-cloudinary
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, isCloudinaryEnabled } from '../lib/cloudinary';

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls PDF, Word et images sont acceptés.'));
  }
};

function buildUpload() {
  if (isCloudinaryEnabled()) {
    // Cloud storage — files stored on Cloudinary CDN
    const cloudStorage = new CloudinaryStorage({
      cloudinary,
      params: async (_req: Express.Request, file: Express.Multer.File) => {
        const isImage = file.mimetype.startsWith('image/');
        return {
          folder: 'unchk-platform',
          resource_type: isImage ? 'image' : 'raw',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
          transformation: isImage ? [{ width: 800, crop: 'limit', quality: 'auto' }] : undefined,
        };
      },
    });

    return multer({
      storage: cloudStorage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    });
  }

  // Local disk storage (development / when Cloudinary not configured)
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${suffix}${ext}`);
    },
  });

  return multer({
    storage: diskStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

export const upload = buildUpload();
