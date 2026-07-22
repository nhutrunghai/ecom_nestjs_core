CREATE UNIQUE INDEX "Brand_name_active_key"
ON "Brand" ("name")
WHERE "deletedAt" IS NULL;
