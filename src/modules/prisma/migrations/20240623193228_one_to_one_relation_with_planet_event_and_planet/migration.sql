/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Planet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planetId]` on the table `PlanetEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planetId` to the `PlanetEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanetEvent" ADD COLUMN     "planetId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Planet_eventId_key" ON "Planet"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetEvent_planetId_key" ON "PlanetEvent"("planetId");
