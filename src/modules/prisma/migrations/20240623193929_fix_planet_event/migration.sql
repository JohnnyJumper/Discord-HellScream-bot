/*
  Warnings:

  - You are about to drop the column `eventId` on the `Planet` table. All the data in the column will be lost.
  - You are about to drop the column `planetId` on the `PlanetEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[planetIndex]` on the table `PlanetEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planetIndex` to the `PlanetEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Planet" DROP CONSTRAINT "Planet_eventId_fkey";

-- DropIndex
DROP INDEX "Planet_eventId_key";

-- DropIndex
DROP INDEX "PlanetEvent_planetId_key";

-- AlterTable
ALTER TABLE "Planet" DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "PlanetEvent" DROP COLUMN "planetId",
ADD COLUMN     "planetIndex" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlanetEvent_planetIndex_key" ON "PlanetEvent"("planetIndex");

-- AddForeignKey
ALTER TABLE "PlanetEvent" ADD CONSTRAINT "PlanetEvent_planetIndex_fkey" FOREIGN KEY ("planetIndex") REFERENCES "Planet"("index") ON DELETE CASCADE ON UPDATE CASCADE;
