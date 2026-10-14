-- CreateTable
CREATE TABLE "TarifaComercio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "minUsuarios" INTEGER NOT NULL,
    "maxUsuarios" INTEGER NOT NULL,
    "valorMensual" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarifaComercio_pkey" PRIMARY KEY ("id")
);
