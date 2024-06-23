-- DropForeignKey
ALTER TABLE "Hazard" DROP CONSTRAINT "Hazard_planetId_fkey";

-- DropForeignKey
ALTER TABLE "Planet" DROP CONSTRAINT "Planet_biomeId_fkey";

-- DropForeignKey
ALTER TABLE "Planet" DROP CONSTRAINT "Planet_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Planet" DROP CONSTRAINT "Planet_statisticsId_fkey";

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "Biome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PlanetEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "PlanetStatistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hazard" ADD CONSTRAINT "Hazard_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
