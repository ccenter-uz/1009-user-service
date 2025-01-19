-- CreateTable
CREATE TABLE "api_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_numeric_id" VARCHAR(15),
    "user_full_name" VARCHAR(300),
    "method" VARCHAR(50),
    "path" VARCHAR(150),
    "request" TEXT,
    "response" TEXT,
    "status" INTEGER,
    "duration" SMALLINT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id")
);
