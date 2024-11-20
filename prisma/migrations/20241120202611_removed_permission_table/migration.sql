/*
  Warnings:

  - You are about to drop the column `permission_id` on the `role_permission` table. All the data in the column will be lost.
  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `permission` to the `role_permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_permission_id_fkey";

-- AlterTable
ALTER TABLE "role_permission" DROP COLUMN "permission_id",
ADD COLUMN     "permission" TEXT NOT NULL;

-- DropTable
DROP TABLE "permission";
