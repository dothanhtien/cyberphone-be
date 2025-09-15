import { unlink } from 'fs/promises';
import { join, resolve } from 'path';

export async function withFileTransaction<T>(
  dbOperation: () => Promise<T>,
  uploadedFilePath?: string,
): Promise<T> {
  try {
    return await dbOperation();
  } catch (err) {
    if (uploadedFilePath) {
      const uploadsRoot = join(process.cwd(), 'uploads');
      const relative = uploadedFilePath
        .replace(/^\/+/, '')
        .replace(/^uploads\/?/, '');
      const fullPath = resolve(uploadsRoot, relative);
      if (!fullPath.startsWith(uploadsRoot)) {
        console.error(
          'Refusing to delete file outside uploads root:',
          fullPath,
        );
      } else {
        try {
          await unlink(fullPath);
        } catch (unlinkErr) {
          console.error(
            'Failed to delete uploaded file after DB failure:',
            unlinkErr,
          );
        }
      }
    }
    throw err;
  }
}
