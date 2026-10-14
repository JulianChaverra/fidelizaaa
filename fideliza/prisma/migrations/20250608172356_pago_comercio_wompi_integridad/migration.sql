/*
  Warnings:

  - Added the required column `updatedAt` to the `PagoComercio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PagoComercio" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "fechaPago" DROP NOT NULL,
ALTER COLUMN "fechaPago" DROP DEFAULT;
