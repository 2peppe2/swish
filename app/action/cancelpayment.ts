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
    const cancelledPayment = await swish.cancelPaymentRequest(payment.id);
    if (cancelledPayment instanceof Error) {
        throw cancelledPayment;
    }
    return cancelledPayment;
};

export { cancelPayment };