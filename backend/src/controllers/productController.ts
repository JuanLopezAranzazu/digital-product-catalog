import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { PRODUCTS_UPLOAD_DIR, MAX_PRODUCT_IMAGES } from "../middleware/upload";

const productImagePublicPath = (filename: string) => `/uploads/products/${filename}`;

const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  price: z.coerce.number().positive("El precio debe ser mayor a 0."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo.").default(0),
  sku: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Selecciona una categoría."),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => (typeof v === "string" ? v === "true" : v ?? true)),
});

// ---------- PÚBLICO ----------

export async function listProducts(req: Request, res: Response) {
  const {
    query = "",
    categorySlug,
    categoryId,
    minPrice,
    maxPrice,
    sort = "recent",
    page = "1",
    pageSize = "12",
  } = req.query as Record<string, string>;

  const where: any = { isActive: true };

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { sku: { contains: query } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  } else if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
      ? { price: "desc" as const }
      : sort === "name_asc"
      ? { name: "asc" as const }
      : { createdAt: "desc" as const };

  const take = Math.min(Number(pageSize) || 12, 48);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    items,
    total,
    page: currentPage,
    pageSize: take,
    totalPages: Math.max(Math.ceil(total / take), 1),
  });
}

export async function getProductBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: { orderBy: { position: "asc" } } },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  res.json(product);
}

// ---------- ADMIN ----------

export async function listProductsAdmin(req: AuthedRequest, res: Response) {
  const { query = "", categoryId, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  const where: any = {};
  if (query) {
    where.OR = [{ name: { contains: query } }, { sku: { contains: query } }];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const take = Math.min(Number(pageSize) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { category: true, images: { orderBy: { position: "asc" } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ items, total, page: currentPage, pageSize: take, totalPages: Math.max(Math.ceil(total / take), 1) });
}

export async function getProductByIdAdmin(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { position: "asc" } } },
  });
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }
  res.json(product);
}

async function uniqueSlugFor(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true });
  let candidate = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findFirst({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function createProduct(req: AuthedRequest, res: Response) {
  const parsed = productSchema.safeParse(req.body);
  const files = (req.files as Express.Multer.File[]) || [];

  if (!parsed.success) {
    files.forEach((f) => fs.unlinkSync(f.path));
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    files.forEach((f) => fs.unlinkSync(f.path));
    return res.status(400).json({ message: "La categoría seleccionada no existe." });
  }

  const slug = await uniqueSlugFor(parsed.data.name);

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      sku: parsed.data.sku || null,
      isActive: parsed.data.isActive ?? true,
      categoryId: parsed.data.categoryId,
      images: {
        create: files.map((file, index) => ({
          url: productImagePublicPath(file.filename),
          position: index,
        })),
      },
    },
    include: { category: true, images: { orderBy: { position: "asc" } } },
  });

  res.status(201).json(product);
}

export async function updateProduct(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  const parsed = productSchema.safeParse(req.body);
  const newFiles = (req.files as Express.Multer.File[]) || [];

  if (!parsed.success) {
    newFiles.forEach((f) => fs.unlinkSync(f.path));
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const existing = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!existing) {
    newFiles.forEach((f) => fs.unlinkSync(f.path));
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    newFiles.forEach((f) => fs.unlinkSync(f.path));
    return res.status(400).json({ message: "La categoría seleccionada no existe." });
  }

  // keepImageIds: ids de imágenes existentes que el admin decidió conservar
  let keepImageIds: string[] = [];
  if (typeof req.body.keepImageIds === "string" && req.body.keepImageIds.length > 0) {
    try {
      keepImageIds = JSON.parse(req.body.keepImageIds);
    } catch {
      keepImageIds = [req.body.keepImageIds];
    }
  }

  const imagesToRemove = existing.images.filter((img) => !keepImageIds.includes(img.id));
  const totalAfterUpdate = keepImageIds.length + newFiles.length;

  if (totalAfterUpdate > MAX_PRODUCT_IMAGES) {
    newFiles.forEach((f) => fs.unlinkSync(f.path));
    return res.status(400).json({ message: `Un producto admite máximo ${MAX_PRODUCT_IMAGES} imágenes.` });
  }

  const slug = parsed.data.name !== existing.name ? await uniqueSlugFor(parsed.data.name, id) : undefined;

  await prisma.$transaction(async (tx) => {
    if (imagesToRemove.length > 0) {
      await tx.productImage.deleteMany({ where: { id: { in: imagesToRemove.map((i) => i.id) } } });
    }

    await tx.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        ...(slug ? { slug } : {}),
        description: parsed.data.description,
        price: parsed.data.price,
        stock: parsed.data.stock,
        sku: parsed.data.sku || null,
        isActive: parsed.data.isActive ?? true,
        categoryId: parsed.data.categoryId,
      },
    });

    if (newFiles.length > 0) {
      const startPosition = keepImageIds.length;
      await tx.productImage.createMany({
        data: newFiles.map((file, index) => ({
          url: productImagePublicPath(file.filename),
          position: startPosition + index,
          productId: id,
        })),
      });
    }
  });

  imagesToRemove.forEach((img) => {
    const filePath = path.join(PRODUCTS_UPLOAD_DIR, path.basename(img.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  const updated = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { position: "asc" } } },
  });

  res.json(updated);
}

export async function deleteProduct(req: AuthedRequest, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  await prisma.product.delete({ where: { id } });

  product.images.forEach((img) => {
    const filePath = path.join(PRODUCTS_UPLOAD_DIR, path.basename(img.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  res.status(204).send();
}
