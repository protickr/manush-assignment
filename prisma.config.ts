import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Use compiled JavaScript seed so it works cleanly in Docker/Node 20
    seed: 'node dist/prisma/seed.js',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
