declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';

  type ParamsFunction = (
    req: Express.Request,
    file: Express.Multer.File,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;

  interface CloudinaryStorageOptions {
    cloudinary: unknown;
    params?: Record<string, unknown> | ParamsFunction;
  }

  class CloudinaryStorage implements StorageEngine {
    constructor(opts: CloudinaryStorageOptions);
    _handleFile(
      req: Express.Request,
      file: Express.Multer.File,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: (error?: any, info?: Partial<Express.Multer.File>) => void,
    ): void;
    _removeFile(
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null) => void,
    ): void;
  }

  export { CloudinaryStorage };
}
