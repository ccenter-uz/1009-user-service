-- AlterTable
ALTER TABLE "users" ADD COLUMN     "attempt" SMALLINT,
ADD COLUMN     "otp_duration" TIMESTAMP(3),
ADD COLUMN     "sms_code" SMALLINT;
