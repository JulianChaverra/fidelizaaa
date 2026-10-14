/*
  Warnings:

  - Added the required column `celular` to the `Comercio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `celularContacto` to the `Comercio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `Comercio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correoContacto` to the `Comercio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreContacto` to the `Comercio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDocumento` to the `Comercio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `Comercio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CC', 'NIT', 'CE');

-- AlterTable
ALTER TABLE "Comercio" ADD COLUMN     "celular" TEXT NOT NULL,
ADD COLUMN     "celularContacto" TEXT NOT NULL,
ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "correoContacto" TEXT NOT NULL,
ADD COLUMN     "nombreContacto" TEXT NOT NULL,
ADD COLUMN     "numeroDocumento" TEXT NOT NULL,
ADD COLUMN     "tipoDocumento" "TipoDocumento" NOT NULL;
