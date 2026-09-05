import { Response, Request } from "express";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "../lib/prisma";

const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
});

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
}

export async function createCategory(req: Request, res: Response) {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { name } = parsed.data;
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) {
    return res.status(409).json({ message: "Ya existe una categoría con ese nombre." });
  }

  const category = await prisma.category.create({ data: { name, slug } });
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { id } = req.params;
  const { name } = parsed.data;
  const slug = slugify(name, { lower: true, strict: true });

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return res.status(404).json({ message: "Categoría no encontrada." });
  }

  const duplicate = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }], NOT: { id } },
  });
  if (duplicate) {
    return res.status(409).json({ message: "Ya existe otra categoría con ese nombre." });
  }

  const updated = await prisma.category.update({ where: { id }, data: { name, slug } });
  res.json(updated);
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return res.status(404).json({ message: "Categoría no encontrada." });
  }

  if (category._count.products > 0) {
    return res.status(409).json({
      message: "No puedes eliminar una categoría con productos asociados. Muévelos o elimínalos primero.",
    });
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
}
