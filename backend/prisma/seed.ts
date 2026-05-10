import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Elektronik' },
      update: {},
      create: { name: 'Elektronik' },
    }),
    prisma.category.upsert({
      where: { name: 'Furnitur' },
      update: {},
      create: { name: 'Furnitur' },
    }),
    prisma.category.upsert({
      where: { name: 'Pakaian' },
      update: {},
      create: { name: 'Pakaian' },
    }),
    prisma.category.upsert({
      where: { name: 'Makanan & Minuman' },
      update: {},
      create: { name: 'Makanan & Minuman' },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Seed Products
  const [elektronik, furnitur, pakaian, makanan] = categories;

  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Laptop Asus VivoBook 15', stock: 25, categoryId: elektronik.id },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Monitor Samsung 24"', stock: 40, categoryId: elektronik.id },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Keyboard Mechanical Logitech', stock: 3, categoryId: elektronik.id },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: { name: 'Mouse Wireless Rexus', stock: 0, categoryId: elektronik.id },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: { name: 'Meja Kerja Minimalis', stock: 12, categoryId: furnitur.id },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: { name: 'Kursi Ergonomis', stock: 8, categoryId: furnitur.id },
    }),
    prisma.product.upsert({
      where: { id: 7 },
      update: {},
      create: { name: 'Kemeja Batik Pria', stock: 50, categoryId: pakaian.id },
    }),
    prisma.product.upsert({
      where: { id: 8 },
      update: {},
      create: { name: 'Kaos Polo Wanita', stock: 2, categoryId: pakaian.id },
    }),
    prisma.product.upsert({
      where: { id: 9 },
      update: {},
      create: { name: 'Kopi Arabica 500g', stock: 100, categoryId: makanan.id },
    }),
    prisma.product.upsert({
      where: { id: 10 },
      update: {},
      create: { name: 'Teh Hijau Organik', stock: 4, categoryId: makanan.id },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
