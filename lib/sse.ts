import { PaymentStatus } from "@/app/generated/prisma/enums";

type ConnectedEvent = {
  type: "connected";
};

type StatusUpdateEvent = {
  type: "status-update";
  id: string;
  reference: string;
  status: PaymentStatus;
};

export type StatusStreamEvent = ConnectedEvent | StatusUpdateEvent;

type StatusStreamClient = {
  id: string;
  reference?: string;
  send: (payload: StatusStreamEvent) => void;
};

const clients = new Map<string, StatusStreamClient>();

export const addStatusStreamClient = (client: StatusStreamClient) => {
  clients.set(client.id, client);
};

export const removeStatusStreamClient = (clientId: string) => {
  clients.delete(clientId);
};

export const notifyStatusUpdate = (payload: StatusUpdateEvent) => {
  for (const client of clients.values()) {
    if (client.reference && client.reference !== payload.reference) {
      continue;
    }

    try {
      client.send(payload);
    } catch {
      clients.delete(client.id);
    }
  }
};
