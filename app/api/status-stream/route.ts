import {
  addStatusStreamClient,
  removeStatusStreamClient,
  type StatusStreamEvent,
} from "@/lib/sse";

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

      const close = () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(keepalive);
        removeStatusStreamClient(clientId);

        try {
          controller.close();
        } catch {
          // Ignore close errors when the stream has already ended.
        }
      };

      const send = (payload: StatusStreamEvent) => {
        controller.enqueue(encodeSseMessage(payload));
      };

      addStatusStreamClient({
        id: clientId,
        reference,
        send,
      });

      send({ type: "connected" });

      const keepalive = setInterval(() => {
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
