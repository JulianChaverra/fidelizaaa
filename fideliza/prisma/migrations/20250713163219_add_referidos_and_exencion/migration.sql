-- AlterTable
ALTER TABLE "Comercio" ADD COLUMN     "codigoReferido" TEXT,
ADD COLUMN     "esExentoDeCobro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referidosAcumulados" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReferidoComercio" (
    "id" TEXT NOT NULL,
    "comercioReferenteId" TEXT NOT NULL,
    "comercioReferidoId" TEXT NOT NULL,
    "usadoEnFactura" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferidoComercio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReferidoComercio" ADD CONSTRAINT "ReferidoComercio_comercioReferenteId_fkey" FOREIGN KEY ("comercioReferenteId") REFERENCES "Comercio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferidoComercio" ADD CONSTRAINT "ReferidoComercio_comercioReferidoId_fkey" FOREIGN KEY ("comercioReferidoId") REFERENCES "Comercio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
