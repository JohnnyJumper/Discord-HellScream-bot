/*
  Warnings:

  - Added the required column `price_formatted` to the `SteamGames` table without a default value. This is not possible if the table is not empty.
  - Made the column `header_image` on table `SteamGames` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SteamGames" ADD COLUMN     "price_formatted" TEXT NOT NULL,
ALTER COLUMN "header_image" SET NOT NULL;
