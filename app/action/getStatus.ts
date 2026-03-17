"use server";

import { expirePaymentIfTimedOut } from "@/lib/paymentExpiry";

const getStatus = async (ref: string) => {
    return expirePaymentIfTimedOut(ref);
};

export { getStatus };
