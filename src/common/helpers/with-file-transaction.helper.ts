import { unlink } from 'fs/promises';
import { relative, resolve } from 'path';
import { UPLOADS_ROOT } from '../constants/path';

/**
 * Ensures uploaded files are deleted if the database operation fails
 *
 * @param dbOperation - The database operation
 * @param uploadedFilePaths - An array of file paths
 */
export async function withFileTransaction<T>(
  dbOperation: () => Promise<T>,
  uploadedFilePaths: string[],
): Promise<T> {
  try {
    return await dbOperation();
  } catch (err) {
    if (uploadedFilePaths.length > 0) {
      const uploadsRoot = UPLOADS_ROOT;

      await Promise.allSettled(
        uploadedFilePaths.map(async (filePath) => {
          const sanitized = filePath
            .replace(/^[/\\]+/, '')
            .replace(/^uploads[/\\]?/i, '');

          const fullPath = resolve(uploadsRoot, sanitized);
          const rel = relative(uploadsRoot, fullPath);

          if (rel.startsWith('..') || rel === '') {
            console.error(
              'Refusing to delete file outside uploads root:',
              fullPath,
            );
            return;
          }

          try {
            await unlink(fullPath);
            console.log('Deleted uploaded file after DB failure:', fullPath);
          } catch (unlinkErr) {
            console.error(
              'Failed to delete uploaded file after DB failure:',
              unlinkErr,
            );
          }
        }),
      );
    }

    throw err;
  }
}
