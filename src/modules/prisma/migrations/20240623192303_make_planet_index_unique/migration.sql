/*
  Warnings:

  - A unique constraint covering the columns `[index]` on the table `Planet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Planet_index_key" ON "Planet"("index");
