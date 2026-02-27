-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payee_payment_reference" TEXT NOT NULL,
    "payment_reference" TEXT,
    "payee_alias" TEXT NOT NULL,
    "payer_alias" TEXT,
    "currency" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    "paid_at" DATETIME,
    "redirect_callback_url" TEXT NOT NULL
);
