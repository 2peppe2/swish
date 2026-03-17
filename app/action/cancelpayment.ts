"use server";

import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";
import swish from "@/lib/swish";
import { isSwishError } from "@/lib/swishPaymentHandler";

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
    if (isSwishError(swishPaymentResponse)) {
        throw new Error(swishPaymentResponse.message);
    }

    if (swishPaymentResponse.status !== "CANCELLED") {
        throw new Error("Payment was not cancelled");
    }
    
    const cancelledPayment = await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            status: "CANCELLED",
        },
    });

    if (payment.status !== cancelledPayment.status) {
        notifyStatusUpdate({
            type: "status-update",
            id: cancelledPayment.id,
            reference: cancelledPayment.payee_payment_reference,
            status: cancelledPayment.status,
        });
    }

    return cancelledPayment;
};

export { cancelPayment };
