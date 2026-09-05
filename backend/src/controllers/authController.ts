import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAdminToken } from "../utils/jwt";
import { AuthedRequest } from "../middleware/auth";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ message: "Correo o contraseña incorrectos." });
  }

  const validPassword = await bcrypt.compare(password, admin.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Correo o contraseña incorrectos." });
  }

  const token = signAdminToken({ id: admin.id, email: admin.email, name: admin.name });

  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
}

export async function me(req: AuthedRequest, res: Response) {
  res.json({ admin: req.admin });
}
