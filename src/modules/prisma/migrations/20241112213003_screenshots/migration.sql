/*
  Warnings:

  - Added the required column `screenshots` to the `SteamGames` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SteamGames" ADD COLUMN     "screenshots" TEXT NOT NULL;
