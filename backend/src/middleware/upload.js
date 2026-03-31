import multer from 'multer';

/** Phone cameras: iPhone HEIC/HEIF; some devices send binary as application/octet-stream */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
  'application/octet-stream',
];
const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB ?? 10);

/** Desktop (esp. macOS) often sends HEIC with empty mimetype or octet-stream — trust extension */
const IMAGE_FILE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i;

// Keep files in memory so we can pass the buffer directly to the AI API
// without a round-trip to disk.
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const name = file.originalname || '';

  if (ALLOWED_MIME_TYPES.includes(mime)) {
    return cb(null, true);
  }
  if ((mime === '' || mime === 'application/octet-stream') && IMAGE_FILE_EXT.test(name)) {
    return cb(null, true);
  }
  cb(
    new Error(
      `Unsupported file type: ${file.mimetype || '(empty)'} (${name}). Allowed: JPEG, PNG, WebP, GIF, HEIC/HEIF, AVIF.`
    )
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

export default upload;
