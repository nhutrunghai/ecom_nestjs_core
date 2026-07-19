-- Replace global unique indexes with partial unique indexes so soft-deleted
-- records do not prevent reusing a role name or user email.
DROP INDEX "Role_name_key";
DROP INDEX "User_email_key";

CREATE UNIQUE INDEX "Role_name_active_key"
ON "Role" ("name")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "User_email_active_key"
ON "User" ("email")
WHERE "deletedAt" IS NULL;
