/*
  Warnings:

  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Distributor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Region` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Retailer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Territory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Retailer" DROP CONSTRAINT "Retailer_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Retailer" DROP CONSTRAINT "Retailer_assignedSrId_fkey";

-- DropForeignKey
ALTER TABLE "Retailer" DROP CONSTRAINT "Retailer_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "Retailer" DROP CONSTRAINT "Retailer_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Retailer" DROP CONSTRAINT "Retailer_territoryId_fkey";

-- DropForeignKey
ALTER TABLE "Territory" DROP CONSTRAINT "Territory_areaId_fkey";

-- DropTable
DROP TABLE "Area";

-- DropTable
DROP TABLE "Distributor";

-- DropTable
DROP TABLE "Region";

-- DropTable
DROP TABLE "Retailer";

-- DropTable
DROP TABLE "Territory";

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "territories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "distributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retailers" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "routes" TEXT,
    "notes" TEXT,
    "regionId" TEXT,
    "areaId" TEXT,
    "territoryId" TEXT,
    "distributorId" TEXT,
    "assignedSrId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retailers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regions_name_idx" ON "regions"("name");

-- CreateIndex
CREATE INDEX "areas_regionId_idx" ON "areas"("regionId");

-- CreateIndex
CREATE INDEX "territories_areaId_idx" ON "territories"("areaId");

-- CreateIndex
CREATE INDEX "distributors_name_idx" ON "distributors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "retailers_uid_key" ON "retailers"("uid");

-- CreateIndex
CREATE INDEX "retailers_assignedSrId_idx" ON "retailers"("assignedSrId");

-- CreateIndex
CREATE INDEX "retailers_regionId_idx" ON "retailers"("regionId");

-- CreateIndex
CREATE INDEX "retailers_areaId_idx" ON "retailers"("areaId");

-- CreateIndex
CREATE INDEX "retailers_territoryId_idx" ON "retailers"("territoryId");

-- CreateIndex
CREATE INDEX "retailers_distributorId_idx" ON "retailers"("distributorId");

-- CreateIndex
CREATE INDEX "retailers_assignedSrId_regionId_idx" ON "retailers"("assignedSrId", "regionId");

-- CreateIndex
CREATE INDEX "retailers_assignedSrId_areaId_idx" ON "retailers"("assignedSrId", "areaId");

-- CreateIndex
CREATE INDEX "retailers_assignedSrId_territoryId_idx" ON "retailers"("assignedSrId", "territoryId");

-- CreateIndex
CREATE INDEX "retailers_assignedSrId_distributorId_idx" ON "retailers"("assignedSrId", "distributorId");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_assignedSrId_fkey" FOREIGN KEY ("assignedSrId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
