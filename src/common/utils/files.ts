export const getFilename = (originalname: string): string =>
  originalname.substring(0, originalname.lastIndexOf('.'));
