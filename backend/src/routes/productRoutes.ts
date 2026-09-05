import { Router, Request, Response, NextFunction } from "express";
import {
  listProducts,
  getProductBySlug,
  listProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { requireAdmin } from "../middleware/auth";
import { uploadProductImages, MAX_PRODUCT_IMAGES } from "../middleware/upload";

const router = Router();

function handleUpload(req: Request, res: Response, next: NextFunction) {
  uploadProductImages(req, res, (err: any) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_COUNT"
          ? `Solo puedes subir hasta ${MAX_PRODUCT_IMAGES} imágenes por producto.`
          : err.code === "LIMIT_FILE_SIZE"
          ? "Cada imagen debe pesar menos de 5MB."
          : err.message || "Error al subir las imágenes.";
      return res.status(400).json({ message });
    }
    next();
  });
}

// Público
router.get("/", listProducts);
router.get("/slug/:slug", getProductBySlug);

// Admin
router.get("/admin/list", requireAdmin, listProductsAdmin);
router.get("/admin/:id", requireAdmin, getProductByIdAdmin);
router.post("/", requireAdmin, handleUpload, createProduct);
router.put("/:id", requireAdmin, handleUpload, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;
