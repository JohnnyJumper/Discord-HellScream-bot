/*
  Warnings:

  - Added the required column `steam_link` to the `SteamGames` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SteamGames" ADD COLUMN     "steam_link" TEXT NOT NULL;
