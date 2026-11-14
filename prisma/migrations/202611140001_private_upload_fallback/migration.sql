CREATE TABLE "PrivateUpload" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "data" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
