/*
  Warnings:

  - Made the column `path` on table `role_permission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "role_permission" ALTER COLUMN "path" SET NOT NULL;
