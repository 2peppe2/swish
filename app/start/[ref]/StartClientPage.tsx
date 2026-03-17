"use client";

import { Payment } from "@/app/types/payment";
import { useState } from "react";
import StartPaymentCard from "./components/StartPaymentCard";

interface StartClientPageProps {
  payment: Payment;
}

const StartClientPage = ({ payment }: StartClientPageProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberTouched, setPhoneNumberTouched] = useState(false);
  const isPhoneNumberValid = /^(?:7\d{8}|07\d{8})$/.test(phoneNumber);
  const phoneNumberError =
    phoneNumberTouched && !isPhoneNumberValid
      ? "Ange ett giltigt mobilnummer, till exempel 70 123 45 67."
      : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl dark:bg-secondary/20" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <StartPaymentCard
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onPhoneNumberBlur={() => setPhoneNumberTouched(true)}
          phoneNumberError={phoneNumberError}
          canSubmit={isPhoneNumberValid}
          payment={payment}
        />
      </div>
    </div>
  );
};

export default StartClientPage;
