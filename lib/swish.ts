import "server-only";

import Swish from "@/lib/swishPaymentHandler";
import log from "@/lib/logger";
import "dotenv/config";

if (
  !process.env.SWISH_CERT_BASE64 ||
  !process.env.SWISH_KEY_BASE64 ||
  !process.env.SWISH_CA_BASE64
) {
  throw new Error("Swish certificate, key, or CA path is not defined in environment variables");
}

if (!process.env.SWISH_CALLBACK_URL || !process.env.SWISH_PAYEE_ALIAS) {
  throw new Error("SWISH_CALLBACK_URL or SWISH_PAYEE_ALIAS is not defined in environment variables");
}

if (!process.env.ENVIRONMENT) {
  throw new Error("ENVIRONMENT is not defined in environment variables");
}

const environment = process.env.ENVIRONMENT;
if (environment !== "production" && environment !== "development" && environment !== "test") {
  log("ERROR", "Swish Initialization", `Invalid ENVIRONMENT value: ${environment}`);
  throw new Error("ENVIRONMENT must be one of 'production', 'development', or 'test'");
}

const cert = Buffer.from(process.env.SWISH_CERT_BASE64!, "base64").toString("utf-8");
const key = Buffer.from(process.env.SWISH_KEY_BASE64!, "base64").toString("utf-8");
const ca = Buffer.from(process.env.SWISH_CA_BASE64!, "base64").toString("utf-8");

const swish = new Swish({
    cert: cert,
    key: key,
    ca: ca,
  }, {
    callbackUrl: process.env.SWISH_CALLBACK_URL,
    payeeAlias: process.env.SWISH_PAYEE_ALIAS,
    currency: process.env.SWISH_CURRENCY ?? "SEK",
  }, environment);

export default swish
