import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const PRODUCTS_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");

if (!fs.existsSync(PRODUCTS_UPLOAD_DIR)) {
  fs.mkdirSync(PRODUCTS_UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB por imagen
export const MAX_PRODUCT_IMAGES = 5;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PRODUCTS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF."));
    return;
  }
  cb(null, true);
}

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_PRODUCT_IMAGES,
  },
}).array("images", MAX_PRODUCT_IMAGES);
