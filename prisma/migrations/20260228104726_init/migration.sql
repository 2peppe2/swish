/*
  Warnings:

  - You are about to drop the column `redirect_callback_url` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `redirect_url_on_payment` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `message` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payer_alias` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payee_payment_reference" TEXT NOT NULL,
    "payment_reference" TEXT,
    "payee_alias" TEXT,
    "payer_alias" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SEK',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "amount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "paid_at" DATETIME,
    "redirect_url_on_payment" TEXT NOT NULL
);
INSERT INTO "new_Payment" ("amount", "created_at", "currency", "id", "message", "paid_at", "payee_alias", "payee_payment_reference", "payer_alias", "payment_reference", "status", "updated_at") SELECT "amount", "created_at", "currency", "id", "message", "paid_at", "payee_alias", "payee_payment_reference", "payer_alias", "payment_reference", "status", "updated_at" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_payee_payment_reference_key" ON "Payment"("payee_payment_reference");
CREATE UNIQUE INDEX "Payment_payment_reference_key" ON "Payment"("payment_reference");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
