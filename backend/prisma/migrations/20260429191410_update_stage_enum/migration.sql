/*
  Warnings:

  - You are about to drop the column `celulaEnsamble` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `celulaPintura` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `fechaEnsamble` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `fechaPintura` on the `car` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `car` DROP COLUMN `celulaEnsamble`,
    DROP COLUMN `celulaPintura`,
    DROP COLUMN `fechaEnsamble`,
    DROP COLUMN `fechaPintura`,
    ADD COLUMN `qrExported` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `qrExportedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Movement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `carId` INTEGER NOT NULL,
    `stageName` ENUM('RECIEN_INGRESADO_A_LA_PLANTA', 'SOLDADURA', 'PINTURA', 'MONTAJE', 'CONTROL_DE_CALIDAD', 'PROCESO_FINALIZADO') NOT NULL,
    `registeredAt` DATETIME(3) NOT NULL,
    `registeredByUserId` INTEGER NULL,
    `registeredByName` VARCHAR(191) NULL,
    `sourceType` ENUM('IMPORT', 'SCAN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Movement_carId_idx`(`carId`),
    INDEX `Movement_registeredByUserId_idx`(`registeredByUserId`),
    INDEX `Movement_stageName_idx`(`stageName`),
    INDEX `Movement_registeredAt_idx`(`registeredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Movement` ADD CONSTRAINT `Movement_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Movement` ADD CONSTRAINT `Movement_registeredByUserId_fkey` FOREIGN KEY (`registeredByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
