/*
  Warnings:

  - You are about to drop the column `positionX` on the `Planet` table. All the data in the column will be lost.
  - You are about to drop the column `positionY` on the `Planet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Planet" DROP COLUMN "positionX",
DROP COLUMN "positionY";
