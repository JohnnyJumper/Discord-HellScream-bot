-- CreateTable
CREATE TABLE "CurrentWarStatus" (
    "id" SERIAL NOT NULL,
    "started" TIMESTAMP(3) NOT NULL,
    "ended" TIMESTAMP(3) NOT NULL,
    "now" TIMESTAMP(3) NOT NULL,
    "clientVersion" TEXT NOT NULL,
    "factions" TEXT[],
    "impactMultiplier" DOUBLE PRECISION NOT NULL,
    "statisticsId" INTEGER NOT NULL,

    CONSTRAINT "CurrentWarStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentWarStatistics" (
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

    CONSTRAINT "CurrentWarStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentWarStatus_statisticsId_key" ON "CurrentWarStatus"("statisticsId");

-- AddForeignKey
ALTER TABLE "CurrentWarStatus" ADD CONSTRAINT "CurrentWarStatus_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "CurrentWarStatistics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
