-- CreateTable
CREATE TABLE "Premio" (
    "id" TEXT NOT NULL,
    "comercioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "valorPuntos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Premio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Premio" ADD CONSTRAINT "Premio_comercioId_fkey" FOREIGN KEY ("comercioId") REFERENCES "Comercio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
