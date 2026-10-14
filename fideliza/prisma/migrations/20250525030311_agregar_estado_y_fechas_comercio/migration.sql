-- AlterTable
ALTER TABLE "Comercio" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaPago" TIMESTAMP(3),
ADD COLUMN     "fechaVencimiento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PagoComercio" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "moneda" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,

    CONSTRAINT "PagoComercio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PagoComercio" ADD CONSTRAINT "PagoComercio_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Comercio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
