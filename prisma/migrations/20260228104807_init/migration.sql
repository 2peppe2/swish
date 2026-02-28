/*
  Warnings:

  - Made the column `payee_alias` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payee_payment_reference" TEXT NOT NULL,
    "payment_reference" TEXT,
    "payee_alias" TEXT NOT NULL,
    "payer_alias" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'SEK',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "amount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "paid_at" DATETIME,
    "redirect_url_on_payment" TEXT NOT NULL
);
INSERT INTO "new_Payment" ("amount", "created_at", "currency", "id", "message", "paid_at", "payee_alias", "payee_payment_reference", "payer_alias", "payment_reference", "redirect_url_on_payment", "status", "updated_at") SELECT "amount", "created_at", "currency", "id", "message", "paid_at", "payee_alias", "payee_payment_reference", "payer_alias", "payment_reference", "redirect_url_on_payment", "status", "updated_at" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_payee_payment_reference_key" ON "Payment"("payee_payment_reference");
CREATE UNIQUE INDEX "Payment_payment_reference_key" ON "Payment"("payment_reference");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
