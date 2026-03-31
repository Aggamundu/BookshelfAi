import imageSize from 'image-size';

const MAX_DIMENSION = Number(process.env.MAX_IMAGE_DIMENSION ?? 8192);

/**
 * After multer: reject images larger than MAX_IMAGE_DIMENSION on the longest side (abuse control).
 */
export function validateImageDimensions(req, res, next) {
  if (!req.file?.buffer) {
    return next();
  }
  try {
    const dim = imageSize(req.file.buffer);
    const w = dim.width ?? 0;
    const h = dim.height ?? 0;
    if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
      return res.status(400).json({
        error: `Image dimensions must be at most ${MAX_DIMENSION}px per side (got ${w}×${h}).`,
      });
    }
    next();
  } catch {
    return res.status(400).json({ error: 'Could not read image dimensions. Use a valid JPEG, PNG, GIF, or WebP.' });
  }
}
