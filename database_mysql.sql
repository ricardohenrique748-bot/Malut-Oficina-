-- --------------------------------------------------------
-- DATASHEET RESET (DROP ALL TABLES)
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `work_orders`;
DROP TABLE IF EXISTS `work_order_status_history`;
DROP TABLE IF EXISTS `work_order_items`;
DROP TABLE IF EXISTS `parts`;
DROP TABLE IF EXISTS `service_catalog`;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `financial_records`;
DROP TABLE IF EXISTS `leads`;
DROP TABLE IF EXISTS `integration_tokens`;

SET FOREIGN_KEY_CHECKS=1;

-- --------------------------------------------------------
-- RE-CREATE TABLES
-- --------------------------------------------------------

﻿-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(100) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `permissions_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` VARCHAR(100) NOT NULL,
    `permissionId` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `document` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` VARCHAR(100) NOT NULL,
    `plate` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `customerId` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vehicles_plate_key`(`plate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_orders` (
    `id` VARCHAR(100) NOT NULL,
    `code` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `customerId` VARCHAR(100) NOT NULL,
    `vehicleId` VARCHAR(100) NULL,
    `status` ENUM('ABERTA', 'DIAGNOSTICO', 'ORCAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'TESTE_QUALIDADE', 'FINALIZADA', 'ENTREGUE', 'GARANTIA') NOT NULL DEFAULT 'ABERTA',
    `responsibleId` VARCHAR(100) NULL,
    `createdById` VARCHAR(100) NOT NULL,
    `totalParts` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalLabor` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalValue` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `scheduledFor` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `work_orders_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_order_status_history` (
    `id` VARCHAR(100) NOT NULL,
    `workOrderId` VARCHAR(100) NOT NULL,
    `oldStatus` ENUM('ABERTA', 'DIAGNOSTICO', 'ORCAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'TESTE_QUALIDADE', 'FINALIZADA', 'ENTREGUE', 'GARANTIA') NULL,
    `newStatus` ENUM('ABERTA', 'DIAGNOSTICO', 'ORCAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'TESTE_QUALIDADE', 'FINALIZADA', 'ENTREGUE', 'GARANTIA') NOT NULL,
    `changedById` VARCHAR(100) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_order_items` (
    `id` VARCHAR(100) NOT NULL,
    `workOrderId` VARCHAR(100) NOT NULL,
    `type` ENUM('PART', 'SERVICE') NOT NULL,
    `catalogItemId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parts` (
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `stockQuantity` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `minStock` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    UNIQUE INDEX `parts_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_catalog` (
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `estimatedMinutes` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` VARCHAR(100) NOT NULL,
    `partId` VARCHAR(100) NOT NULL,
    `type` ENUM('IN', 'OUT') NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_records` (
    `id` VARCHAR(100) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `workOrderId` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` VARCHAR(100) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `ramo` VARCHAR(191) NULL,
    `faturamento_raw` VARCHAR(191) NULL,
    `faturamento_categoria` VARCHAR(191) NULL,
    `invest_raw` VARCHAR(191) NULL,
    `invest_categoria` VARCHAR(191) NULL,
    `objetivo` VARCHAR(191) NULL,
    `faz_trafego` VARCHAR(191) NULL,
    `tags_ai` VARCHAR(191) NULL,
    `score_potencial` INTEGER NOT NULL DEFAULT 0,
    `urgencia` VARCHAR(191) NULL,
    `resumo_ai` VARCHAR(191) NULL,
    `status_kanban` VARCHAR(191) NOT NULL DEFAULT 'cold',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `integration_tokens` (
    `id` VARCHAR(100) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NOT NULL,
    `refreshToken` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `integration_tokens_provider_key`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_status_history` ADD CONSTRAINT `work_order_status_history_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_status_history` ADD CONSTRAINT `work_order_status_history_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_items` ADD CONSTRAINT `work_order_items_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_partId_fkey` FOREIGN KEY (`partId`) REFERENCES `parts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_records` ADD CONSTRAINT `financial_records_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `work_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
-- Create ADMIN Role if not exists
INSERT INTO roles (id, name, description) 
SELECT 'role_admin_001', 'ADMIN', 'Administrator with full access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

-- Update roleId variable if it already existed (subquery magic not needed if we hardcode access, but let's assume we use the hardcoded ID for simplicity or look it up)
-- Actually, easier to just UPSERT logic for user.

-- Insert User
INSERT INTO users (id, name, email, passwordHash, roleId, active, createdAt, updatedAt)
VALUES ('user_admin_001', 'Ricardo Luz', 'ricardo.luz@eunaman.com.br', '$2a$10$L8ZwvTL.WxTxZWqWCNcEtOogzdOTYKzK7GOfjDhYlNmmNP89lve8m', 
        (SELECT id FROM roles WHERE name='ADMIN' LIMIT 1), 
        1, '2026-01-02 20:27:17', '2026-01-02 20:27:17')
ON DUPLICATE KEY UPDATE 
    passwordHash='$2a$10$L8ZwvTL.WxTxZWqWCNcEtOogzdOTYKzK7GOfjDhYlNmmNP89lve8m', 
    active=1,
    roleId=(SELECT id FROM roles WHERE name='ADMIN' LIMIT 1),
    updatedAt='2026-01-02 20:27:17';

