CREATE UNIQUE INDEX "ProductTranslation_product_language_active_key"
ON "ProductTranslation" ("productId", "languageId")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "SKU_product_value_active_key"
ON "SKU" ("productId", "value")
WHERE "deletedAt" IS NULL;
