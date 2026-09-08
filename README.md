# Catálogo Digital de Productos

Aplicación full-stack para mostrar un catálogo de productos en línea, con búsqueda y filtros para el público, y un panel de administración protegido con autenticación para gestionar productos y categorías (incluyendo subida de hasta 5 imágenes por producto).

## Stack

**Backend:** Node.js + TypeScript + Express + Prisma (SQLite) + Multer + JWT
**Frontend:** React + TypeScript + Vite + Tailwind CSS + Base UI (primitivos accesibles, estilo shadcn/ui)

## Estructura del proyecto

```
digital-product-catalog/
├── backend/          # API REST
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── controllers/    # lógica de auth, categorías y productos
│   │   ├── middleware/     # auth (JWT) y upload (multer)
│   │   ├── routes/
│   │   ├── seed.ts         # datos de ejemplo
│   │   └── index.ts
│   └── uploads/products/   # imágenes subidas (servidas como estáticos)
└── frontend/          # SPA
    └── src/
        ├── components/ui/      # Button, Input, Select, Dialog, Sheet, Table...
        ├── components/catalog/ # tarjetas, filtros, paginación
        ├── components/admin/   # formularios de producto/categoría
        ├── pages/               # CatalogPage, ProductDetailPage, admin/*
        └── context/             # Auth
```

## Requisitos previos

- Node.js 18 o superior
- npm

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # ya viene copiado con valores de desarrollo
npx prisma migrate dev --name init   # crea la base SQLite y las tablas
npm run prisma:seed                  # crea el admin y datos de ejemplo
npm run dev                          # http://localhost:4000
```

Credenciales de administrador creadas por el seed (puedes cambiarlas en `.env` antes de sembrar):

- **Email:** admin@catalogo.com
- **Contraseña:** Admin123!

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (por defecto 4000) |
| `DATABASE_URL` | Ruta del archivo SQLite |
| `JWT_SECRET` | Secreto para firmar tokens |
| `JWT_EXPIRES_IN` | Expiración del token (ej. `7d`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales que crea el seed |
| `CORS_ORIGIN` | Origen permitido (URL del frontend) |

## 2. Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

El frontend usa un proxy de Vite (`/api` y `/uploads` → `http://localhost:4000`), así que no necesitas configurar CORS manualmente en desarrollo.

## Funcionalidades

### Catálogo público
- Grid de productos responsive (2 columnas en mobile, hasta 4 en desktop)
- Búsqueda por texto (nombre, descripción, SKU)
- Filtro por categoría, rango de precio y orden (recientes, precio, nombre)
- Filtros en sidebar fijo (desktop) o panel deslizante (mobile)
- Página de detalle con galería de imágenes, precio, stock y descripción

### Panel de administración (`/admin/login`)
- Login con JWT
- CRUD de **categorías** (no se puede eliminar una categoría con productos asociados)
- CRUD de **productos**: nombre, descripción, precio, stock, SKU, categoría, estado (publicado/oculto)
- Subida de **hasta 5 imágenes** por producto (JPG/PNG/WEBP/GIF, máx. 5MB cada una), con opción de conservar/eliminar imágenes existentes al editar
- Tabla con búsqueda, filtro por categoría y paginación

## Build de producción

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
```
