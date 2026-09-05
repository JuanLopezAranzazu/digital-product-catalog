import "dotenv/config";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { prisma } from "./lib/prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@catalogo.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: { name: "Administrador", email: adminEmail, password: hashed },
    });
    console.log(`Admin creado -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("El admin ya existe, se omite creación.");
  }

  const categoriesData = [
    "Cerámica",
    "Textiles",
    "Iluminación",
    "Mobiliario",
    "Papelería",
  ];

  const categories: Record<string, string> = {};
  for (const name of categoriesData) {
    const slug = slugify(name, { lower: true, strict: true });
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
    categories[name] = category.id;
  }

  const productsData = [
    {
      name: "Jarrón Terracota Alto",
      description:
        "Jarrón de cerámica hecho a mano con acabado en terracota mate. Pieza única de gran formato, ideal para espacios luminosos.",
      price: 89000,
      stock: 12,
      sku: "CER-001",
      category: "Cerámica",
    },
    {
      name: "Set de Tazones Nórdicos",
      description:
        "Juego de 4 tazones de cerámica esmaltada con tonos tierra. Aptos para horno y microondas.",
      price: 64000,
      stock: 20,
      sku: "CER-002",
      category: "Cerámica",
    },
    {
      name: "Manta de Lana Merino",
      description:
        "Manta tejida en telar con lana merino 100% natural. Textura suave y abrigo duradero para las noches frías.",
      price: 145000,
      stock: 8,
      sku: "TEX-001",
      category: "Textiles",
    },
    {
      name: "Cojín Trenzado Lino",
      description: "Funda de cojín en lino grueso con detalle trenzado a mano. Incluye relleno de fibra siliconada.",
      price: 52000,
      stock: 25,
      sku: "TEX-002",
      category: "Textiles",
    },
    {
      name: "Lámpara de Mesa Bruma",
      description:
        "Lámpara de mesa con base de cerámica y pantalla de lino crudo. Luz cálida ideal para salas de estar y estudios.",
      price: 178000,
      stock: 6,
      sku: "ILU-001",
      category: "Iluminación",
    },
    {
      name: "Aplique de Pared Arco",
      description: "Aplique de pared metálico con curva minimalista, acabado en bronce cepillado.",
      price: 132000,
      stock: 10,
      sku: "ILU-002",
      category: "Iluminación",
    },
    {
      name: "Mesa Auxiliar Roble",
      description: "Mesa auxiliar en madera maciza de roble con patas torneadas. Fabricación local en pequeños lotes.",
      price: 320000,
      stock: 4,
      sku: "MOB-001",
      category: "Mobiliario",
    },
    {
      name: "Banco Bajo Nogal",
      description: "Banco bajo de líneas simples en madera de nogal, perfecto como mesa de centro o asiento extra.",
      price: 285000,
      stock: 5,
      sku: "MOB-002",
      category: "Mobiliario",
    },
    {
      name: "Cuaderno Encuadernado a Mano",
      description: "Cuaderno de tapa dura con encuadernación artesanal y papel de algodón de 120g.",
      price: 38000,
      stock: 30,
      sku: "PAP-001",
      category: "Papelería",
    },
    {
      name: "Set de Postales Botánicas",
      description: "Colección de 12 postales ilustradas con motivos botánicos, impresas en papel texturizado.",
      price: 24000,
      stock: 40,
      sku: "PAP-002",
      category: "Papelería",
    },
  ];

  for (const p of productsData) {
    const slug = slugify(p.name, { lower: true, strict: true });
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) continue;

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        sku: p.sku,
        categoryId: categories[p.category],
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/${slug}/800/800`,
              position: 0,
            },
          ],
        },
      },
    });
  }

  console.log("Seed completado: categorías y productos de ejemplo creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
