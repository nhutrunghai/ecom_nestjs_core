CREATE UNIQUE INDEX "Permission_method_path_active_key"
ON "Permission" ("method", "path")
WHERE "deletedAt" IS NULL;
