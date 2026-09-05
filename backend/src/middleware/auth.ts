import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../utils/jwt";

export interface AuthedRequest extends Request {
  admin?: AdminTokenPayload;
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado. Falta el token de acceso." });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAdminToken(token);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Sesión inválida o expirada. Inicia sesión de nuevo." });
  }
}
