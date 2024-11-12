/*
  Warnings:

  - Added the required column `initial_formatted` to the `SteamGames` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SteamGames" ADD COLUMN     "initial_formatted" TEXT NOT NULL;
