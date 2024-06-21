/*
  Warnings:

  - You are about to drop the column `statisticsId` on the `Planet` table. All the data in the column will be lost.
  - You are about to drop the column `planetId` on the `PlanetStatistics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlanetStatistics" DROP CONSTRAINT "PlanetStatistics_planetId_fkey";

-- DropIndex
DROP INDEX "Planet_statisticsId_key";

-- DropIndex
DROP INDEX "PlanetStatistics_planetId_key";

-- AlterTable
ALTER TABLE "Planet" DROP COLUMN "statisticsId";

-- AlterTable
ALTER TABLE "PlanetStatistics" DROP COLUMN "planetId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "PlanetStatistics_id_seq";

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_id_fkey" FOREIGN KEY ("id") REFERENCES "PlanetStatistics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
