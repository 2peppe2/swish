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
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
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
