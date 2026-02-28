"server-only"
import Swish from "@/lib/swishPaymentHandler";
import "dotenv/config";

if (
  !process.env.SWISH_CERT_PATH ||
  !process.env.SWISH_KEY_PATH ||
  !process.env.SWISH_CA_PATH
) {
  throw new Error("Swish certificate, key, or CA path is not defined in environment variables");
}

if (!process.env.SWISH_CALLBACK_URL || !process.env.SWISH_PAYEE_ALIAS) {
  throw new Error("SWISH_CALLBACK_URL or SWISH_PAYEE_ALIAS is not defined in environment variables");
}

if (!process.env.ENVIRONMENT) {
  throw new Error("ENVIRONMENT is not defined in environment variables");
}

const developerMode = process.env.ENVIRONMENT === "development";

const swish = new Swish({
    cert: process.env.SWISH_CERT_PATH,
    key: process.env.SWISH_KEY_PATH,
    ca: process.env.SWISH_CA_PATH,
  }, {
    callbackUrl: process.env.SWISH_CALLBACK_URL,
    payeeAlias: process.env.SWISH_PAYEE_ALIAS,
    currency: process.env.SWISH_CURRENCY ?? "SEK",
  }, developerMode);

export default swish
