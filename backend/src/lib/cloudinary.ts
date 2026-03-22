import { v2 as cloudinary } from 'cloudinary';
import logger from './logger';

let configured = false;

function configureCloudinary() {
  if (configured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL } = process.env;

  if (CLOUDINARY_URL || (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
    logger.info('Cloudinary: stockage cloud activé');
  } else {
    logger.info('Cloudinary: variables non configurées — stockage local utilisé');
  }
}

export function isCloudinaryEnabled(): boolean {
  configureCloudinary();
  return configured;
}

export { cloudinary };
