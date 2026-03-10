import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin & Sales Rep Users ──────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const srPassword = await bcrypt.hash('sr123456', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '01700000000' },
    update: {},
    create: {
      name: 'Admin User',
      phone: '01700000000',
      role: Role.ADMIN,
      passwordHash: adminPassword,
    },
  });
  console.log(`  ✅ Admin: ${admin.name} (${admin.phone})`);

  const sr1 = await prisma.user.upsert({
    where: { phone: '01711111111' },
    update: {},
    create: {
      name: 'SR Karim',
      phone: '01711111111',
      role: Role.SALES_REPRESENTATIVE,
      passwordHash: srPassword,
    },
  });

  const sr2 = await prisma.user.upsert({
    where: { phone: '01722222222' },
    update: {},
    create: {
      name: 'SR Rahim',
      phone: '01722222222',
      role: Role.SALES_REPRESENTATIVE,
      passwordHash: srPassword,
    },
  });
  console.log(`  ✅ Sales Reps: ${sr1.name}, ${sr2.name}`);

  // ─── Regions ──────────────────────────────────────────────
  const regions = await Promise.all(
    ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet'].map((name) =>
      prisma.region.create({ data: { name } }),
    ),
  );
  console.log(`  ✅ ${regions.length} Regions created`);

  // ─── Areas (2 per region) ─────────────────────────────────
  const areas: any[] = [];
  for (const region of regions) {
    const a1 = await prisma.area.create({
      data: { name: `${region.name} North`, regionId: region.id },
    });
    const a2 = await prisma.area.create({
      data: { name: `${region.name} South`, regionId: region.id },
    });
    areas.push(a1, a2);
  }
  console.log(`  ✅ ${areas.length} Areas created`);

  // ─── Territories (2 per area) ─────────────────────────────
  const territories: any[] = [];
  for (const area of areas) {
    const t1 = await prisma.territory.create({
      data: { name: `${area.name} Zone-1`, areaId: area.id },
    });
    const t2 = await prisma.territory.create({
      data: { name: `${area.name} Zone-2`, areaId: area.id },
    });
    territories.push(t1, t2);
  }
  console.log(`  ✅ ${territories.length} Territories created`);

  // ─── Distributors ─────────────────────────────────────────
  const distributors = await Promise.all(
    [
      'ABC Distribution',
      'XYZ Wholesale',
      'National Traders',
      'Delta Supply Co.',
    ].map((name) => prisma.distributor.create({ data: { name } })),
  );
  console.log(`  ✅ ${distributors.length} Distributors created`);

  // ─── Retailers (100 sample, split between 2 SRs) ─────────
  const retailerData = [];
  for (let i = 1; i <= 100; i++) {
    const territory = territories[i % territories.length];
    const area = areas.find((a: any) => a.id === territory.areaId);
    const region = regions.find((r: any) => r.id === area?.regionId);
    const distributor = distributors[i % distributors.length];

    retailerData.push({
      uid: `R${String(i).padStart(5, '0')}`,
      name: `Retailer ${i}`,
      phone: `0190${String(i).padStart(7, '0')}`,
      points: Math.floor(Math.random() * 500),
      routes: `Route-${(i % 10) + 1}`,
      regionId: region?.id,
      areaId: area?.id,
      territoryId: territory.id,
      distributorId: distributor.id,
      assignedSrId: i <= 50 ? sr1.id : sr2.id,
    });
  }

  await prisma.retailer.createMany({ data: retailerData });
  console.log(`  ✅ ${retailerData.length} Retailers created (50 per SR)`);

  console.log('\n🎉 Seeding complete!');
  console.log('  Login credentials:');
  console.log('    Admin:    phone=01700000000  password=admin123');
  console.log('    SR Karim: phone=01711111111  password=sr123456');
  console.log('    SR Rahim: phone=01722222222  password=sr123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
