import axios, { AxiosInstance } from "axios";
import https from "https";
import fs from "fs";

interface AgentCertificates {
  cert: string;
  key: string;
  ca: string;
}

interface PaymentRequest {
  id?: string;
  payeePaymentReference: string;
  payerAlias: string;
  amount: string;
  message?: string;
}

interface RefundRequest {
  originalPaymentReference: string;
  payerAlias: string;
  amount: string;
  message?: string;
  payerPaymentReference?: string;
}

interface QrRequest {
  payee: string;
  amount?: {
    value: number;
    editable?: boolean;
  };
  message?: {
    value: string;
    editable?: boolean;
  };
  size?: number;
  border?: number;
}

type SwishApiErrorDetail = {
  errorCode: string;
  errorMessage: string;
  additionalInformation?: string;
};

type SwishApiErrorResponse = SwishApiErrorDetail | SwishApiErrorDetail[];

export type SwishError = {
  message: string;
  data?: SwishApiErrorResponse;
  status?: number;
};

type SwishPaymentRequestStatus =
  | "CREATED"
  | "PAID"
  | "ERROR"
  | "DECLINED"
  | "CANCELLED";

type SwishPaymentRequestResponse = {
  id: string;
  payeePaymentReference: string;
  paymentReference: string | null;
  callbackUrl: string;
  payerAlias: string | null;
  payeeAlias: string;
  amount: number;
  currency: string;
  message: string;
  status: SwishPaymentRequestStatus;
  dateCreated: string;
  datePaid: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

type CancelPaymentRequestPatchOperation = {
  op: "replace";
  path: "/status";
  value: "cancelled";
};

type SwishRefundRequestStatus = "CREATED" | "PAID" | "ERROR" | "DECLINED";

type SwishRefundRequestResponse = {
  id: string;
  payerPaymentReference: string | null;
  originalPaymentReference: string;
  callbackUrl: string;
  payerAlias: string;
  payeeAlias: string;
  amount: number;
  currency: string;
  message: string;
  status: SwishRefundRequestStatus;
  dateCreated: string;
  datePaid: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

type CreatePaymentSuccess = {
  uuid: string;
  status: number;
  location?: string;
};

type CreateRefundSuccess = {
  uuid: string;
  status: number;
  location?: string;
};

export const isSwishError = (value: unknown): value is SwishError =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof (value as { message?: unknown }).message === "string";

export type {
  PaymentRequest,
  RefundRequest,
  QrRequest,
  CreatePaymentSuccess,
  CreateRefundSuccess,
  SwishPaymentRequestResponse,
  SwishRefundRequestResponse,
  SwishPaymentRequestStatus,
  SwishRefundRequestStatus,
  SwishApiErrorDetail,
  SwishApiErrorResponse,
};

export default class PaymentHandler {
  private _agent: https.Agent;
  private client: AxiosInstance;

  private certFile: string;
  private keyFile: string;
  private caFile: string;
  private callbackUrl: string;
  private payeeAlias: string;
  private currency: string;
  private development: boolean;

  /**
   * Initialize a new PaymentHandler
   * @param certFile The path to the certificate file
   * @param keyFile The path to the key file
   * @param caFile The path to the ca file
   */
  constructor(
    certs: AgentCertificates,
    defaults: { callbackUrl: string; payeeAlias: string; currency: string },
    development: boolean,
  ) {
    this.certFile = certs.cert;
    this.keyFile = certs.key;
    this.caFile = certs.ca;
    this.callbackUrl = defaults.callbackUrl;
    this.payeeAlias = defaults.payeeAlias;
    this.currency = defaults.currency;
    this.development = development;

    this._agent = new https.Agent({
      cert: fs.readFileSync(this.certFile, { encoding: "utf-8" }),
      key: fs.readFileSync(this.keyFile, { encoding: "utf-8" }),
      ca: fs.readFileSync(this.caFile, { encoding: "utf-8" }),
    });

    this.client = axios.create({
      httpsAgent: this._agent,
    });
  }

  private baseURL(version: "v1" | "v2" = "v2") {
    const base = this.development
      ? "https://mss.cpc.getswish.net/swish-cpcapi/api/"
      : "https://cpc.getswish.net/swish-cpcapi/api/";

    return `${base}${version}/`;
  }

  private generateUUID() {
    const hexValues = "0123456789ABCDEF";
    let hexNumber = "";
    for (let i = 0; i < 32; i++) {
      hexNumber += hexValues[Math.floor(Math.random() * hexValues.length)];
    }
    return hexNumber;
  }

  private formatError(error: unknown): SwishError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
      };
    }
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "Unknown error" };
  }

  /**
   *
   * @param options The options for the payment request
   * @param development If the request is for development or production
   * @returns The uuid, status and location of the payment request
   */
  public async createPaymentRequest(
    options: PaymentRequest,
  ): Promise<CreatePaymentSuccess | SwishError> {
    const uuid = options.id ?? this.generateUUID();
    const data = {
      payeePaymentReference: options.payeePaymentReference,
      callbackUrl: this.callbackUrl,
      payeeAlias: this.payeeAlias,
      currency: this.currency,
      payerAlias: options.payerAlias,
      amount: options.amount,
      message: options.message,
    };

    const url = `${this.baseURL("v2")}paymentrequests/${uuid}`;
    try {
      const res = await this.client.put(url, data);
      return {
        uuid: uuid,
        status: res.status,
        location: res.headers.location as string | undefined,
      };
    } catch (e: unknown) {
      return this.formatError(e);
    }
  }

  /**
   *
   * @param location The location of the payment request
   * @returns the data of the payment request
   */
  public async retrievePaymentRequest(
    location: string,
  ): Promise<SwishPaymentRequestResponse | SwishError> {
    try {
      const res = await this.client.get<SwishPaymentRequestResponse>(location);

      return res.data;
    } catch (e: unknown) {
      return this.formatError(e);
    }
  }

  /**
   *
   * @param uuid
   * @returns the data of the payment cancellation request
   */
  public async cancelPaymentRequest(
    uuid: string,
  ): Promise<SwishPaymentRequestResponse | SwishError> {
    try {
      const url = `${this.baseURL("v1")}paymentrequests/${uuid}`;
      const patchBody: CancelPaymentRequestPatchOperation[] = [
        {
          op: "replace",
          path: "/status",
          value: "cancelled",
        },
      ];

      const res = await this.client.patch<SwishPaymentRequestResponse>(
        url,
        patchBody,
        {
          headers: {
            "Content-Type": "application/json-patch+json",
          },
        },
      );
      return res.data;
    } catch (e: unknown) {
      return this.formatError(e);
    }
  }

  public async createRefundRequest(
    paymentUUID: string,
    options: RefundRequest,
  ): Promise<CreateRefundSuccess | SwishError> {
    try {
      // TODO: error: Callback URL is missing or does not use Https
      const data = {
        originalPaymentReference: options.originalPaymentReference,
        payerAlias: options.payerAlias,
        amount: options.amount,
        currency: this.currency,
        callbackUrl: this.callbackUrl,
        payeeAlias: this.payeeAlias,
        message: options.message,
        payerPaymentReference: options.payerPaymentReference,
      };

      const url = `${this.baseURL("v2")}refunds/${paymentUUID}`;

      const res = await this.client.put(url, data);
      return {
        uuid: paymentUUID,
        status: res.status,
        location: res.headers.location as string | undefined,
      };
    } catch (e: unknown) {
      return this.formatError(e);
    }
  }

  public async retrieveRefundRequest(
    location: string,
  ): Promise<SwishRefundRequestResponse | SwishError> {
    try {
      const res = await this.client.get<SwishRefundRequestResponse>(location);
      return res.data;
    } catch (e: unknown) {
      return this.formatError(e);
    }
  }

  public async generateQRCode(
    options: QrRequest,
  ): Promise<unknown | SwishError> {
    try {
      const res = await this.client.post(
        "https://api.swish.nu/qr/v2/prefilled",
        options,
      );
      return res.data;
    } catch (e: unknown) {
      return this.formatError(e);
    }
  }
}
