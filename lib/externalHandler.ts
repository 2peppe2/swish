interface ExternalPayment {
  payer_alias: string | null;
  amount: number;
  message: string;
  redirect_url: string;
}

interface ExternalPaymentError {
  error: string;
}

type ExternalPaymentResponse = ExternalPayment | ExternalPaymentError;

const isExternalPaymentError = (
  value: ExternalPaymentResponse,
): value is ExternalPaymentError => "error" in value;

const getRequiredEnv = (key: "EXTERNAL_API_URL" | "EXTERNAL_API_KEY") => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
};

const normalizeExternalPayment = (paymentData: unknown): ExternalPaymentResponse => {
  if (typeof paymentData !== "object" || paymentData === null) {
    return {
      error: "Invalid payment data received from external API",
    };
  }

  const data = paymentData as {
    payer_alias?: unknown;
    amount?: unknown;
    message?: unknown;
    redirect_url?: unknown;
  };

  if (typeof data.amount !== "number" || !Number.isFinite(data.amount) || data.amount <= 0) {
    return {
      error: "Invalid amount received from external API",
    };
  }

  if (typeof data.message !== "string" || data.message.trim().length === 0 || data.message.length > 50) {
    return {
      error: "Invalid message received from external API",
    };
  }

  if (typeof data.redirect_url !== "string" || data.redirect_url.trim().length === 0) {
    return {
      error: "Invalid redirect_url received from external API",
    };
  }

  if (data.payer_alias !== null && data.payer_alias !== undefined && typeof data.payer_alias !== "string") {
    return {
      error: "Invalid payer_alias received from external API",
    };
  }

  return {
    payer_alias: data.payer_alias ?? null,
    amount: data.amount,
    message: data.message,
    redirect_url: data.redirect_url,
  };
};

const getExternalPayment = async (
  reference: string,
): Promise<ExternalPaymentResponse> => {
  try {
    const externalApiUrl = getRequiredEnv("EXTERNAL_API_URL");
    const externalApiKey = getRequiredEnv("EXTERNAL_API_KEY");

    const response = await fetch(`${externalApiUrl}/${reference}`, {
      headers: {
        Authorization: `Bearer ${externalApiKey}`,
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        error: "Payment not found",
      };
    }

    if (!response.ok) {
      console.error(
        `Failed to fetch payment from external API: ${response.status} ${response.statusText}`,
      );
      return {
        error: `Failed to fetch payment: ${response.statusText}`,
      };
    }

    const paymentData = await response.json();
    return normalizeExternalPayment(paymentData);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while fetching external payment";

    return {
      error: message,
    };
  }
};

const updateExternalPayment = async (
  reference: string,
  status: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const externalApiUrl = getRequiredEnv("EXTERNAL_API_URL");
    const externalApiKey = getRequiredEnv("EXTERNAL_API_KEY");

    const response = await fetch(`${externalApiUrl}/${reference}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${externalApiKey}`,
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Failed to update payment status on external API: ${response.status} ${response.statusText}`,
      );
      return {
        success: false,
        error: `Failed to update payment status: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while updating external payment";

    return {
      success: false,
      error: message,
    };
  }
};

export { getExternalPayment, isExternalPaymentError, updateExternalPayment };
export type { ExternalPayment, ExternalPaymentError, ExternalPaymentResponse };
