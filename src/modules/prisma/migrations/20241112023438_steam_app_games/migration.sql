-- CreateTable
CREATE TABLE "SteamGames" (
    "id" SERIAL NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "genres" TEXT NOT NULL,
    "release_date" TEXT NOT NULL,
    "detailed_description" TEXT NOT NULL,
    "about_the_game" TEXT NOT NULL,

    CONSTRAINT "SteamGames_pkey" PRIMARY KEY ("id")
);
