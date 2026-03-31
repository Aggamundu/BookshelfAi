import sharp from 'sharp';

/** MIME types that need decode → JPEG for OpenAI vision */
const CONVERT_TO_JPEG = new Set([
  'image/heic',
  'image/heif',
  'image/avif',
  'application/octet-stream',
]);

function isHeifLikeName(name) {
  return /\.(heic|heif|avif)$/i.test(name || '');
}

function shouldDecodeToJpeg(mimetype, originalname) {
  if (isHeifLikeName(originalname)) {
    return true;
  }
  return CONVERT_TO_JPEG.has((mimetype || '').toLowerCase());
}

/**
 * After multer: decode HEIC/HEIF/AVIF (and mis-tagged / empty MIME from desktop) to JPEG for vision + dimension checks.
 */
export async function normalizePhoneImage(req, res, next) {
  if (!req.file?.buffer?.length) {
    return next();
  }

  const { mimetype, originalname } = req.file;

  if (!shouldDecodeToJpeg(mimetype, originalname)) {
    return next();
  }

  try {
    const out = await sharp(req.file.buffer).rotate().jpeg({ quality: 92 }).toBuffer();
    req.file.buffer = out;
    req.file.mimetype = 'image/jpeg';
    next();
  } catch {
    return res.status(400).json({
      error:
        'Could not read this photo (common with HEIC/HEIF). Try opening it in Preview and exporting as JPEG, or use “Most Compatible” in iPhone Camera settings.',
    });
  }
}
