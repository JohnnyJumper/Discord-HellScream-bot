/*
  Warnings:

  - Added the required column `authors` to the `SteamGames` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SteamGames" ADD COLUMN     "authors" TEXT NOT NULL;
