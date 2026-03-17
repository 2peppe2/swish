"use server";

import prisma from "@/lib/prisma";
import swish from "@/lib/swish";

const cancelPayment = async (reference: string) => {
    const payment = await prisma.payment.findUnique({
        where: {
            payee_payment_reference: reference,
        },
    });
    if (!payment) {
        throw new Error(`Payment with reference ${reference} not found`);
    }
    const swishPaymentResponse = await swish.cancelPaymentRequest(payment.id);
    console.log("Swish cancel response:", swishPaymentResponse);
    if (!swishPaymentResponse.status || swishPaymentResponse.status !== "CANCELLED") {
        throw new Error(swishPaymentResponse.message);
    }
    
    const cancelledPayment = await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            status: "CANCELLED",
        },
    });
    return cancelledPayment;
};

export { cancelPayment };
