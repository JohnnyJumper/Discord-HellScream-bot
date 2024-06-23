-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);
