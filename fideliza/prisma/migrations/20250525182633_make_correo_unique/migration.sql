/*
  Warnings:

  - A unique constraint covering the columns `[correo]` on the table `Comercio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comercio_correo_key" ON "Comercio"("correo");
