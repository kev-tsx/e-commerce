import { PrismaClient } from '@prisma/client';
export type { SeedProduct, ValidSizes, ValidTypes, Gender } from '@prisma/client';

declare global {
  var prisma: PrismaClient | null
}

export const prisma = global.prisma || new PrismaClient();

if(process.env.NODE_ENV !== 'production') global.prisma = prisma;