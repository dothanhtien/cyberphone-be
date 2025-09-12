import { unlink } from 'fs/promises';
import { join } from 'path';

export async function withFileTransaction<T>(
  dbOperation: () => Promise<T>,
  uploadedFilePath?: string,
): Promise<T> {
  try {
    return await dbOperation();
  } catch (err) {
    if (uploadedFilePath) {
      const fullPath = join(process.cwd(), 'public', uploadedFilePath);
      try {
        await unlink(fullPath);
      } catch (unlinkErr) {
        console.error(
          'Failed to delete uploaded file after DB failure:',
          unlinkErr,
        );
      }
    }
    throw err;
  }
}
