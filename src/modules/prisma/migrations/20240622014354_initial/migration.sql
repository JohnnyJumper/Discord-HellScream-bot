-- CreateTable
CREATE TABLE "Planet" (
    "id" SERIAL NOT NULL,
    "index" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "biomeId" INTEGER NOT NULL,
    "hash" BIGINT NOT NULL,
    "positionX" BIGINT NOT NULL,
    "positionY" BIGINT NOT NULL,
    "waypoints" BIGINT[],
    "maxHealth" BIGINT NOT NULL,
    "health" BIGINT NOT NULL,
    "disabled" BOOLEAN NOT NULL,
    "initialOwner" TEXT NOT NULL,
    "currentOwner" TEXT NOT NULL,
    "regenPerSecond" DOUBLE PRECISION NOT NULL,
    "eventId" INTEGER,
    "statisticsId" INTEGER NOT NULL,
    "attacking" BIGINT[],

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
    "eventType" BIGINT NOT NULL,
    "faction" TEXT NOT NULL,
    "health" BIGINT NOT NULL,
    "maxHealth" BIGINT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "campaignId" BIGINT NOT NULL,
    "jointOperationIds" BIGINT[],

    CONSTRAINT "PlanetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanetStatistics" (
    "id" SERIAL NOT NULL,
    "missionsWon" BIGINT NOT NULL,
    "missionsLost" BIGINT NOT NULL,
    "missionTime" BIGINT NOT NULL,
    "terminidKills" BIGINT NOT NULL,
    "automatonKills" BIGINT NOT NULL,
    "illuminateKills" BIGINT NOT NULL,
    "bulletsFired" BIGINT NOT NULL,
    "bulletsHit" BIGINT NOT NULL,
    "timePlayed" BIGINT NOT NULL,
    "deaths" BIGINT NOT NULL,
    "revives" BIGINT NOT NULL,
    "friendlies" BIGINT NOT NULL,
    "missionSuccessRate" BIGINT NOT NULL,
    "accuracy" BIGINT NOT NULL,
    "playerCount" BIGINT NOT NULL,

    CONSTRAINT "PlanetStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Planet_name_key" ON "Planet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Planet_statisticsId_key" ON "Planet"("statisticsId");

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "Biome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PlanetEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "PlanetStatistics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hazard" ADD CONSTRAINT "Hazard_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
