import { unlink } from 'fs/promises';
import { relative, resolve } from 'path';
import { UPLOADS_ROOT } from '../constants/path';

export async function withFileTransaction<T>(
  dbOperation: () => Promise<T>,
  uploadedFilePath?: string | null,
): Promise<T> {
  try {
    return await dbOperation();
  } catch (err) {
    if (uploadedFilePath) {
      const uploadsRoot = UPLOADS_ROOT;
      const sanitized = uploadedFilePath
        .replace(/^[/\\]+/, '')
        .replace(/^uploads[/\\]?/i, '');
      const fullPath = resolve(uploadsRoot, sanitized);
      const rel = relative(uploadsRoot, fullPath);
      if (rel.startsWith('..') || rel === '') {
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
