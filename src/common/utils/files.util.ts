export const getFilename = (originalname: string): string =>
  (() => {
    const lastDotIndex = originalname.lastIndexOf('.');
    return lastDotIndex > 0
      ? originalname.substring(0, lastDotIndex)
      : originalname;
  })();
