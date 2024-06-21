-- CreateTable
CREATE TABLE "Planet" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "biomeId" INTEGER NOT NULL,
    "hash" INTEGER NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "waypoints" INTEGER[],
    "maxHealth" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "disabled" BOOLEAN NOT NULL,
    "initialOwner" TEXT NOT NULL,
    "currentOwner" TEXT NOT NULL,
    "regenPerSecond" DOUBLE PRECISION NOT NULL,
    "eventId" INTEGER,
    "statisticsId" INTEGER NOT NULL,
    "attacking" INTEGER[],

    CONSTRAINT "Planet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Biome" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Biome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hazard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "planetId" INTEGER NOT NULL,

    CONSTRAINT "Hazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanetEvent" (
    "id" SERIAL NOT NULL,
    "eventType" INTEGER NOT NULL,
    "faction" TEXT NOT NULL,
    "health" INTEGER NOT NULL,
    "maxHealth" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "jointOperationIds" INTEGER[],

    CONSTRAINT "PlanetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanetStatistics" (
    "id" SERIAL NOT NULL,
    "missionsWon" INTEGER NOT NULL,
    "missionsLost" INTEGER NOT NULL,
    "missionTime" INTEGER NOT NULL,
    "terminidKills" INTEGER NOT NULL,
    "automatonKills" INTEGER NOT NULL,
    "illuminateKills" INTEGER NOT NULL,
    "bulletsFired" INTEGER NOT NULL,
    "bulletsHit" INTEGER NOT NULL,
    "timePlayed" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "revives" INTEGER NOT NULL,
    "friendlies" INTEGER NOT NULL,
    "missionSuccessRate" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "planetId" INTEGER NOT NULL,

    CONSTRAINT "PlanetStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Planet_name_key" ON "Planet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Planet_statisticsId_key" ON "Planet"("statisticsId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetStatistics_planetId_key" ON "PlanetStatistics"("planetId");

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "Biome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PlanetEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hazard" ADD CONSTRAINT "Hazard_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanetStatistics" ADD CONSTRAINT "PlanetStatistics_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
