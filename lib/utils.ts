import { PaymentStatus } from "@/app/generated/prisma/enums";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isTerminalStatus = (status: PaymentStatus) =>
    status === PaymentStatus.PAID ||
    status === PaymentStatus.CANCELLED ||
    status === PaymentStatus.DECLINED ||
    status === PaymentStatus.ERROR;

export const formattedAmount = (amount: number) => {
    return new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
    }).format(amount);
};