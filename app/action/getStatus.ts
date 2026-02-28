import prisma from "@/lib/prisma";

const getStatus = async (ref: string) => {
    const payment = await prisma.payment.findUnique({
        where: {
            payee_payment_reference: ref,
        },
    });
    if (!payment) {
        throw new Error(`Payment with reference ${ref} not found`);
    }
    return payment.status;
}
export { getStatus };
