-- CreateEnum
CREATE TYPE "TipoCodigoReferido" AS ENUM ('fideliza', 'comercio', 'promo');

-- CreateTable
CREATE TABLE "CodigoReferido" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoCodigoReferido" NOT NULL,
    "comercioId" TEXT,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodigoReferido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodigoReferido_codigo_key" ON "CodigoReferido"("codigo");

-- AddForeignKey
ALTER TABLE "CodigoReferido" ADD CONSTRAINT "CodigoReferido_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Comercio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
