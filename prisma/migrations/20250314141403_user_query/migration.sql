-- CreateTable
CREATE TABLE "UserQuery" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "queryText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuery_pkey" PRIMARY KEY ("id")
);
