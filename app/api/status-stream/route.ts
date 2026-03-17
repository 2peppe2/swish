import {
  addStatusStreamClient,
  removeStatusStreamClient,
  type StatusStreamEvent,
} from "@/lib/sse";
import {
  expirePaymentIfTimedOut,
  getPaymentTimeoutRemainingMs,
} from "@/lib/paymentExpiry";
import { isTerminalStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

const encodeSseMessage = (payload: StatusStreamEvent) =>
  encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

const encodeKeepalive = () => encoder.encode(":\n\n");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") ?? undefined;
  const clientId = crypto.randomUUID();

  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let keepalive: ReturnType<typeof setInterval> | null = null;
      let expiryTimer: ReturnType<typeof setTimeout> | null = null;

      const close = () => {
        if (closed) {
          return;
        }

        closed = true;
        if (keepalive) {
          clearInterval(keepalive);
        }
        if (expiryTimer) {
          clearTimeout(expiryTimer);
        }
        removeStatusStreamClient(clientId);

        try {
          controller.close();
        } catch {
          // Ignore close errors when the stream has already ended.
        }
      };

      const send = (payload: StatusStreamEvent) => {
        controller.enqueue(encodeSseMessage(payload));

        if (
          payload.type === "status-update" &&
          isTerminalStatus(payload.status)
        ) {
          queueMicrotask(close);
        }
      };

      addStatusStreamClient({
        id: clientId,
        reference,
        send,
      });

      send({ type: "connected" });

      if (reference) {
        void (async () => {
          try {
            const remainingMs = await getPaymentTimeoutRemainingMs(reference);
            if (remainingMs === null || closed) {
              return;
            }

            if (remainingMs === 0) {
              await expirePaymentIfTimedOut(reference);
              return;
            }

            expiryTimer = setTimeout(() => {
              void expirePaymentIfTimedOut(reference);
            }, remainingMs);
          } catch {
            close();
          }
        })();
      }

      keepalive = setInterval(() => {
        try {
          controller.enqueue(encodeKeepalive());
        } catch {
          close();
        }
      }, 15000);

      request.signal.addEventListener("abort", close, { once: true });
      cleanup = close;
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
