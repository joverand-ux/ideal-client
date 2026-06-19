import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL is required at runtime; Prisma will error if not set
    url: process.env.DATABASE_URL ?? "",
  },
});
