# Developer Documentation

This document explains how this project is put together, how the payment flow works, and where to look when changing behavior.

The application is a Next.js App Router payment frontend for Swish. It lets a user open a payment link, enter a Swedish mobile number, start a Swish payment request, wait for Swish to call back, and then land on a final status page. The app also contains hooks for an external order/payment system that can provide payment details and receive final status updates.

## Table of Contents

- [Technology Stack](#technology-stack)
- [High-Level Architecture](#high-level-architecture)
- [Request Flow](#request-flow)
- [Routes](#routes)
- [Server Actions](#server-actions)
- [Swish Integration](#swish-integration)
- [External System Integration](#external-system-integration)
- [Database](#database)
- [Payment Status Lifecycle](#payment-status-lifecycle)
- [Realtime Status Updates](#realtime-status-updates)
- [Timeouts and Cancellation](#timeouts-and-cancellation)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Scripts](#scripts)
- [UI Structure](#ui-structure)
- [Logging](#logging)
- [Testing and Manual Verification](#testing-and-manual-verification)
- [Known Implementation Notes](#known-implementation-notes)
- [Common Change Recipes](#common-change-recipes)
- [File Map](#file-map)

## Technology Stack

- **Next.js 16 App Router** for server-rendered pages, route handlers, and server actions.
- **React 19** for client components.
- **TypeScript** with `strict` mode enabled.
- **Tailwind CSS 4** for styling.
- **shadcn/ui** components, configured in `components.json`.
- **Lucide React** for icons.
- **Prisma 7** with the generated client emitted to `app/generated/prisma`.
- **MariaDB** at runtime through `@prisma/adapter-mariadb`.
- **Axios** for Swish API calls that require a custom HTTPS client certificate agent.
- **Server-Sent Events** for realtime payment status updates from the server to the waiting page.

## High-Level Architecture

The app is split into these main areas:

- `app/start/[ref]`: payment entry screen. Loads payment data by reference and lets the user enter a mobile number.
- `app/waiting/[ref]`: waiting screen. Opens an SSE connection and watches payment status until it becomes terminal.
- `app/status/[ref]`: final status screen. Shows paid/cancelled/declined/error content and a continuation action.
- `app/action`: server actions used by client components.
- `app/api`: route handlers used by Swish callbacks, SSE, and polling.
- `lib`: infrastructure code for Prisma, Swish, external API calls, SSE state, expiry, logging, and shared utilities.
- `prisma`: Prisma schema split across model files.
- `components/ui`: local shadcn/ui primitives.
- `docs/external-api-contract.md`: contract expected from the external order/payment system.

The core runtime dependency chain is:

```txt
Browser page
  -> client component
  -> server action or route handler
  -> Prisma / Swish / external API
  -> database state update
  -> SSE notification
  -> browser navigates to the correct page
```

## Request Flow

### 1. User opens a payment link

The entry URL is:

```txt
/start/:ref
```

`ref` is the `payee_payment_reference`, which is the merchant/order-side payment reference.

`app/start/[ref]/page.tsx` calls `getExternalPayment(ref)` from `app/action/external.ts`.

That server action currently:

1. Checks whether a `Payment` row already exists for the reference.
2. Returns it if found.
3. Otherwise creates a temporary test payment through `temporaryPayment(ref)`.

There is already commented code in `app/action/external.ts` for the intended production behavior:

1. Fetch payment details from the external API.
2. Validate the response.
3. Upsert the local `Payment` row.
4. Return that row to the start page.

### 2. Start page decides where the user belongs

`app/start/[ref]/page.tsx` redirects based on local status:

- Terminal statuses go to `/status/:ref`.
- `CREATED` goes to `/waiting/:ref`.
- `INITIATED` renders the payment form.

Terminal statuses are defined by `isTerminalStatus` in `lib/utils.ts`:

- `PAID`
- `CANCELLED`
- `DECLINED`
- `ERROR`

### 3. User enters a mobile number and clicks pay

The visible form lives under:

- `app/start/[ref]/StartClientPage.tsx`
- `app/start/[ref]/components/StartPaymentCard.tsx`
- `app/start/[ref]/components/startPayButton.tsx`

Client-side validation accepts Swedish mobile numbers in either of these digit-only forms:

- `7XXXXXXXX`
- `07XXXXXXXX`

When the user clicks **Betala**, `StartPayButton` calls the `startPayment` server action.

### 4. `startPayment` creates the Swish payment request

`app/action/startPayment.ts`:

1. Normalizes the entered number to Swish format:
   - `07XXXXXXXX` becomes `467XXXXXXXX`.
   - `7XXXXXXXX` becomes `467XXXXXXXX`.
2. Updates the local `Payment.payer_alias`.
3. Calls `swish.createPaymentRequest`.
4. If Swish accepts the request, updates local status to `CREATED`.
5. Returns `{ ok: true }`.

The Swish request uses:

- Local payment `id` as the Swish payment request UUID.
- `payee_payment_reference` as `payeePaymentReference`.
- The normalized phone number as `payerAlias`.
- Payment amount and message from the database.

On success, the client navigates to:

```txt
/waiting/:ref
```

### 5. Waiting page listens for status changes

`app/waiting/[ref]/page.tsx` loads the payment and renders `WaitingClientPage`.

`WaitingClientPage`:

1. Opens an `EventSource` to `/api/status-stream?reference=:ref`.
2. Polls `/api/payment-status/:ref` once at startup.
3. Keeps a countdown to the local timeout.
4. Shows a cancel button while the payment is non-terminal.
5. Navigates to `/status/:ref` once the status becomes terminal.

### 6. Swish sends callback

Swish posts to:

```txt
POST /api/swish-callback
```

`app/api/swish-callback/route.ts`:

1. Checks the source IP from `x-forwarded-for`.
2. Rejects requests outside the hard-coded Swish IP allowlist.
3. Parses the Swish callback body.
4. Looks up the payment by Swish `id`.
5. Updates local payment fields and status.
6. Notifies waiting SSE clients if the status changed.
7. Calls the external API status update endpoint.
8. Returns `200`.

### 7. Final status page

`app/status/[ref]/page.tsx` loads the payment.

If the payment is not terminal, it redirects:

- `INITIATED` -> `/start/:ref`
- other non-terminal statuses -> `/waiting/:ref`

For terminal statuses it uses `statusContent` from `app/status/[ref]/components/statusContent.ts` to choose copy, icons, and color tone.

## Routes

### Pages

#### `GET /start/:ref`

Main entry point for a payment reference.

Important file:

- `app/start/[ref]/page.tsx`

Behavior:

- Loads or creates the local payment through `getExternalPayment`.
- Shows a not-found message if no payment can be found.
- Redirects terminal payments to `/status/:ref`.
- Redirects `CREATED` payments to `/waiting/:ref`.
- Renders the start form for `INITIATED` payments.

#### `GET /waiting/:ref`

Waiting screen after a Swish payment request has been created.

Important files:

- `app/waiting/[ref]/page.tsx`
- `app/waiting/[ref]/WaitingClientPage.tsx`

Behavior:

- Loads payment by reference.
- Passes initial status and `updated_at` to the client component.
- Client component listens for SSE updates.
- Client component redirects to `/status/:ref` when payment becomes terminal.

#### `GET /status/:ref`

Final status page.

Important files:

- `app/status/[ref]/page.tsx`
- `app/status/[ref]/components/statusContent.ts`
- `app/status/[ref]/components/StatusDetails.tsx`
- `app/status/[ref]/components/StatusHero.tsx`

Behavior:

- Loads payment by reference.
- Redirects away if the payment is not terminal.
- Shows terminal status copy and a primary action.
- Uses `redirect_url_on_payment` as the continuation/callback URL in the status details.

### API Route Handlers

#### `GET /api/payment-status/:ref`

Important file:

- `app/api/payment-status/[ref]/route.ts`

Behavior:

- Calls `expirePaymentIfTimedOut(ref)`.
- Returns the current status as JSON:

```json
{
  "status": "CREATED"
}
```

This route is used by the waiting page as a fallback/status refresh path.

#### `GET /api/status-stream?reference=:ref`

Important file:

- `app/api/status-stream/route.ts`

Behavior:

- Creates an SSE stream.
- Registers a client in the in-memory client map in `lib/sse.ts`.
- Sends an initial `{ "type": "connected" }` event.
- Sends keepalive comments every 15 seconds.
- Sets an expiry timer for the payment if `reference` is present.
- Sends status update events when `notifyStatusUpdate` is called.
- Closes automatically after a terminal status event.

Event shape:

```ts
type StatusStreamEvent =
  | { type: "connected" }
  | {
      type: "status-update";
      id: string;
      reference: string;
      status: PaymentStatus;
    };
```

#### `POST /api/swish-callback`

Important files:

- `app/api/swish-callback/route.ts`
- `app/api/swish-callback/types.ts`

Behavior:

- Receives asynchronous Swish payment updates.
- Requires a valid IP in the `x-forwarded-for` header.
- Updates the local `Payment` row.
- Sends an SSE update if the status changed.
- Calls `updateExternalPayment` to notify the external system.

Allowed callback statuses according to the local callback type:

- `PAID`
- `DECLINED`
- `ERROR`
- `CANCELLED`

The callback route updates these local fields:

- `payment_reference`
- `payer_alias`
- `payee_alias`
- `status`
- `paid_at`

## Server Actions

### `startPayment`

File:

- `app/action/startPayment.ts`

Purpose:

- Validates/normalizes a Swedish payer mobile number.
- Persists the payer alias.
- Creates the Swish payment request.
- Moves local status to `CREATED`.

Return type:

```ts
type StartPaymentResult =
  | { ok: true }
  | { ok: false; error: string };
```

Phone normalization:

```txt
07XXXXXXXX -> 467XXXXXXXX
7XXXXXXXX  -> 467XXXXXXXX
```

### `cancelPayment`

File:

- `app/action/cancelPayment.ts`

Purpose:

- Cancels an active payment.
- If the payment has already been created in Swish, it first retrieves the Swish payment.
- If Swish says the payment is already terminal, local state is synced instead of cancelling.
- Otherwise it sends a Swish cancellation request.
- Updates local status to `CANCELLED`.
- Notifies SSE subscribers when status changes.

Parameters:

```ts
cancelPayment(reference: string, isCreated = true)
```

The `isCreated` parameter controls whether the action attempts Swish-side cancellation. The default assumes the Swish request exists.

### `getStatus`

File:

- `app/action/getStatus.ts`

Purpose:

- Calls `expirePaymentIfTimedOut(ref)` and returns the resulting status.

This action is currently very small; the API route `/api/payment-status/:ref` uses the same underlying expiry function.

### `getExternalPayment`

File:

- `app/action/external.ts`

Purpose:

- Loads a local payment by `payee_payment_reference`.
- Currently creates a temporary local payment if none exists.
- Contains commented code for fetching from the external API and upserting the payment.

Current temporary behavior creates:

- `payee_alias`: `46705472993`
- `amount`: `100`
- `status`: `INITIATED`
- `message`: `Test payment`
- `redirect_url_on_payment`: `https://example.com/redirect`

## Swish Integration

Swish integration is split into:

- `lib/swish.ts`: environment validation and singleton construction.
- `lib/swishPaymentHandler.ts`: actual Swish HTTP client wrapper.

### Swish client initialization

`lib/swish.ts` requires:

- `SWISH_CERT_BASE64`
- `SWISH_KEY_BASE64`
- `SWISH_CA_BASE64`
- `SWISH_CALLBACK_URL`
- `SWISH_PAYEE_ALIAS`
- `ENVIRONMENT`

The certificate, key, and CA values are expected to be base64-encoded PEM content. They are decoded into UTF-8 strings and passed directly to `https.Agent`.

`ENVIRONMENT` must be one of:

- `production`
- `development`
- `test`

### Swish base URLs

`lib/swishPaymentHandler.ts` maps environment to Swish API base URL:

```txt
production  -> https://cpc.getswish.net/swish-cpcapi/api/
development -> https://mss.cpc.getswish.net/swish-cpcapi/api/
test        -> https://staging.getswish.pub.tds.tieto.com/swish-cpcapi/api/
```

The class appends the API version:

```txt
{base}/v1/
{base}/v2/
```

### Swish methods

`PaymentHandler` currently supports:

- `createPaymentRequest(options)`
- `retrievePaymentRequest(id)`
- `cancelPaymentRequest(uuid)`
- `createRefundRequest(paymentUUID, options)`
- `retrieveRefundRequest(location)`
- `generateQRCode(options)`

Only payment creation, retrieval, and cancellation are used by the current UI flow.

### Swish error handling

Errors are normalized to:

```ts
type SwishError = {
  kind: "swish_error";
  message: string;
  data?: SwishApiErrorResponse;
  status?: number;
};
```

Use `isSwishError(value)` before treating a Swish response as a success.

## External System Integration

The external system integration is defined in:

- `lib/externalHandler.ts`
- `docs/external-api-contract.md`
- commented production code in `app/action/external.ts`

### Required external API environment

- `EXTERNAL_API_URL`
- `EXTERNAL_API_KEY`

### Fetch payment details

The app expects to call:

```http
GET /{reference}
Authorization: Bearer <EXTERNAL_API_KEY>
```

Expected response:

```json
{
  "payer_alias": null,
  "amount": 100.1,
  "message": "Test payment",
  "redirect_url": "https://example.com/checkout/complete"
}
```

Validation rules in `lib/externalHandler.ts`:

- `amount` must be a finite number greater than `0`.
- `message` must be a non-empty string with length `<= 50`.
- `redirect_url` must be a non-empty string.
- `payer_alias` must be a string, `null`, or omitted.

### Push payment status

The app calls:

```http
POST /{reference}/status
Content-Type: application/json
Authorization: Bearer <EXTERNAL_API_KEY>
```

Body:

```json
{
  "status": "PAID"
}
```

This is called from the Swish callback handler after the local database update.

## Database

Prisma schema entry:

- `prisma/schema.prisma`

Model files:

- `prisma/models/payment.prisma`
- `prisma/models/logging.prisma`

Generated Prisma client output:

- `app/generated/prisma`

Runtime Prisma client:

- `lib/prisma.ts`

### Database provider

The Prisma datasource provider is `mysql`.

At runtime, `lib/prisma.ts` constructs a Prisma client with `PrismaMariaDb` and these environment variables:

- `DATABASE_HOST`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

`prisma.config.ts` also references `DATABASE_URL` for Prisma CLI operations.

### `Payment` model

Defined in `prisma/models/payment.prisma`.

Fields:

```prisma
model Payment {
  id                       String        @id
  payee_payment_reference  String        @unique
  payment_reference        String?       @unique
  payee_alias              String
  payer_alias              String?
  currency                 Currency      @default(SEK)
  message                  String
  status                   PaymentStatus @default(INITIATED)
  amount                   Float
  created_at               DateTime      @default(now())
  updated_at               DateTime      @updatedAt
  paid_at                  DateTime?
  redirect_url_on_payment  String
}
```

Important field meanings:

- `id`: local ID and Swish payment request UUID.
- `payee_payment_reference`: merchant/order reference; this is the `:ref` in URLs.
- `payment_reference`: reference returned by bank/Swish after payment.
- `payee_alias`: merchant Swish number.
- `payer_alias`: customer Swish number.
- `status`: local lifecycle state.
- `redirect_url_on_payment`: where the user can continue after the terminal status page.

### `PaymentStatus` enum

```prisma
enum PaymentStatus {
  INITIATED
  CREATED
  PAID
  ERROR
  DECLINED
  CANCELLED
}
```

### `Currency` enum

```prisma
enum Currency {
  SEK
}
```

### `logger` model

Defined in `prisma/models/logging.prisma`.

```prisma
model logger {
  id         String   @id @default(uuid())
  level      LogLevel
  type       String
  message    String
  timestamp  DateTime @default(now())
}
```

### `LogLevel` enum

```prisma
enum LogLevel {
  INFO
  WARN
  ERROR
}
```

## Payment Status Lifecycle

The intended lifecycle is:

```txt
INITIATED
  -> CREATED
      -> PAID
      -> DECLINED
      -> ERROR
      -> CANCELLED
```

### `INITIATED`

Initial local state before a Swish payment request exists.

Common sources:

- A payment was fetched from the external system and saved locally.
- The current temporary test implementation created a placeholder payment.

The user should be on `/start/:ref`.

### `CREATED`

Swish payment request has been created.

Set by:

- `startPayment` after `swish.createPaymentRequest` succeeds.

The user should be on `/waiting/:ref`.

### `PAID`

Terminal success state.

Set by:

- Swish callback.
- Swish status sync inside `cancelPayment` if the payment became terminal before cancellation.

The user should be on `/status/:ref`.

### `DECLINED`

Terminal unsuccessful state.

Usually set by Swish callback.

### `ERROR`

Terminal technical failure state.

Usually set by Swish callback.

### `CANCELLED`

Terminal cancellation state.

Can be set by:

- User cancellation through `cancelPayment`.
- Timeout through `expirePaymentIfTimedOut`.
- Swish callback.

## Realtime Status Updates

Realtime updates use Server-Sent Events.

Important files:

- `lib/sse.ts`
- `app/api/status-stream/route.ts`
- `app/waiting/[ref]/WaitingClientPage.tsx`

`lib/sse.ts` stores clients in a module-level `Map`.

Each client has:

```ts
type StatusStreamClient = {
  id: string;
  reference?: string;
  send: (payload: StatusStreamEvent) => void;
};
```

When `notifyStatusUpdate(payload)` is called:

1. The server iterates all connected clients.
2. If a client subscribed to a specific reference, unrelated updates are skipped.
3. Matching clients receive the status update.
4. Broken clients are removed.

Important limitation: this is process-local memory. If the app runs on multiple server instances, an update received by one instance will not automatically notify SSE clients connected to another instance. For multi-instance deployments, use a shared pub/sub system or database-backed event mechanism.

## Timeouts and Cancellation

Payment timeout configuration:

- `lib/paymentTimeoutConfig.ts`

Current timeout:

```ts
const PAYMENT_TIMEOUT_MS = 3 * 60 * 1000;
```

That is 3 minutes.

### Timeout behavior

`expirePaymentIfTimedOut(reference)` in `lib/paymentExpiry.ts`:

1. Loads the payment by `payee_payment_reference`.
2. Returns immediately if payment is terminal.
3. Computes expiry as `updated_at + PAYMENT_TIMEOUT_MS`.
4. If not expired, returns current status.
5. If expired, attempts an atomic `updateMany` from `INITIATED` or `CREATED` to `CANCELLED`.
6. Notifies SSE subscribers if it successfully cancelled.
7. If another process changed the row first, reloads and returns the latest status.

The atomic update checks both:

- `id`
- previous `updated_at`
- current status in `[INITIATED, CREATED]`

This reduces race conditions between callback, cancellation, and timeout.

### Cancellation behavior

`cancelPayment(reference, isCreated = true)`:

1. Loads local payment.
2. If `isCreated` is true:
   - Retrieves current Swish payment status.
   - If terminal, syncs local state.
   - Otherwise sends cancellation to Swish.
3. Updates local status to `CANCELLED`.
4. Notifies SSE subscribers.

## Environment Variables

These variables are read by the codebase.

### Database

Used by `lib/prisma.ts` at runtime:

```txt
DATABASE_HOST=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
```

Used by Prisma CLI through `prisma.config.ts`:

```txt
DATABASE_URL=
```

### Swish

Used by `lib/swish.ts`:

```txt
SWISH_CERT_BASE64=
SWISH_KEY_BASE64=
SWISH_CA_BASE64=
SWISH_CALLBACK_URL=
SWISH_PAYEE_ALIAS=
SWISH_CURRENCY=SEK
ENVIRONMENT=development
```

`SWISH_CURRENCY` is optional and defaults to `SEK`.

`ENVIRONMENT` must be:

```txt
production
development
test
```

### External API

Used by `lib/externalHandler.ts`:

```txt
EXTERNAL_API_URL=
EXTERNAL_API_KEY=
```

Note that the current active `getExternalPayment` implementation does not call `lib/externalHandler.ts` because it still uses the temporary test payment path. The callback route does call `updateExternalPayment`, so `EXTERNAL_API_URL` and `EXTERNAL_API_KEY` are needed for a fully working callback path.

## Local Development

### Install dependencies

```bash
npm install
```

### Configure environment

Create a local `.env` with the variables listed above.

For local development you need both:

- MariaDB connection fields for runtime.
- `DATABASE_URL` for Prisma CLI commands.

The Swish client is imported by `startPayment` and `cancelPayment`, and `lib/swish.ts` validates Swish env vars at module load time. Missing Swish env vars will throw before those flows can run.

### Generate Prisma client

The Prisma generator writes generated code to:

```txt
app/generated/prisma
```

Run:

```bash
npx prisma generate
```

### Run database migration

Current script:

```bash
npm run migrate
```

Script definition:

```bash
npx prisma migrate dev --name init && npx prisma generate
```

There is no `prisma/migrations` directory in the current tree, so the first migration will be created when this is run against a configured database.

### Start dev server

```bash
npm run dev
```

Default URL:

```txt
http://localhost:3000
```

Then open:

```txt
http://localhost:3000/start/YOUR_REFERENCE
```

With the current temporary payment implementation, any new reference creates a local test payment.

## Scripts

Defined in `package.json`.

### `npm run dev`

Runs:

```bash
next dev
```

Starts the Next.js development server.

### `npm run build`

Runs:

```bash
next build
```

Builds the production app.

### `npm run start`

Runs:

```bash
next start
```

Serves a previously built production app.

### `npm run lint`

Runs:

```bash
eslint
```

Uses `eslint.config.mjs`, with Next.js core web vitals and TypeScript presets.

### `npm run migrate`

Runs:

```bash
npx prisma migrate dev --name init && npx prisma generate
```

Applies a development migration and regenerates Prisma client code.

## UI Structure

### Global layout

File:

- `app/layout.tsx`

Responsibilities:

- Loads Geist fonts.
- Imports global CSS.
- Wraps the app in `ThemeProvider`.
- Adds the background and page shell.

Metadata currently still uses the default create-next-app values:

```ts
title: "Create Next App"
description: "Generated by create next app"
```

### Global CSS

File:

- `app/globals.css`

Responsibilities:

- Imports Tailwind CSS.
- Imports shadcn Tailwind integration.
- Defines theme tokens for light and dark mode.
- Defines the `.payment-flow-card` view transition name.
- Adds fallback animation styles for payment-card transitions.

### Start screen

Files:

- `app/start/[ref]/StartClientPage.tsx`
- `app/start/[ref]/components/StartPaymentCard.tsx`
- `app/start/[ref]/components/StartCardHeader.tsx`
- `app/start/[ref]/components/StartCardFooter.tsx`
- `app/start/[ref]/components/PaymentInfoDialog.tsx`
- `app/start/[ref]/components/startPayButton.tsx`

Main responsibilities:

- Collect customer mobile number.
- Display amount.
- Start payment request.

### Waiting screen

Files:

- `app/waiting/[ref]/WaitingClientPage.tsx`
- `app/waiting/[ref]/components/WaitingActions.tsx`
- `app/waiting/[ref]/components/WaitingMetaInfo.tsx`
- `app/waiting/[ref]/components/WaitingStatusPanel.tsx`

Main responsibilities:

- Show waiting state.
- Show timeout countdown.
- Open Swish button on mobile user agents.
- Allow cancellation.
- Listen for SSE updates.

### Status screen

Files:

- `app/status/[ref]/components/statusContent.ts`
- `app/status/[ref]/components/StatusHero.tsx`
- `app/status/[ref]/components/StatusSummary.tsx`
- `app/status/[ref]/components/StatusDetails.tsx`
- `app/status/[ref]/components/StatusActions.tsx`

Main responsibilities:

- Render final status-specific content.
- Show a continue/retry/back action using the stored callback URL.

### Shared UI components

Files:

- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/field.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/separator.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/spinner.tsx`
- `components/ui/theme-provider.tsx`

These are shadcn-style local components. Use the existing `cn` helper from `lib/utils.ts` for class merging.

## Logging

File:

- `lib/logger.ts`

Usage:

```ts
log("INFO", "StartPayment", "message");
log("WARN", "Callback", "message");
log("ERROR", "StartPayment", "message");
```

The logger writes to the `logger` table asynchronously and catches database write errors by printing to `console.error`.

It truncates `type` and `message` to 191 characters before saving. Truncation currently appends a single ellipsis character.

## Testing and Manual Verification

There is no dedicated automated test suite in the current project.

Recommended checks before shipping changes:

```bash
npm run lint
npm run build
```

### Manual happy path

1. Start the app:

   ```bash
   npm run dev
   ```

2. Open a new reference:

   ```txt
   http://localhost:3000/start/ORDER-123
   ```

3. Enter a Swedish mobile number like:

   ```txt
   701234567
   ```

4. Click **Betala**.

5. Confirm the app navigates to:

   ```txt
   /waiting/ORDER-123
   ```

6. Trigger a callback or update status in the database.

7. Confirm the waiting page navigates to:

   ```txt
   /status/ORDER-123
   ```

### Mock callback script

File:

- `scripts/mock-swish-callback.sh`

Usage:

```bash
bash scripts/mock-swish-callback.sh <payment-id> <payee-payment-reference> [status]
```

Example:

```bash
bash scripts/mock-swish-callback.sh 0902D12C7FAE43D3AAAC49622AA79FEF ORDER-123 PAID
```

Supported mock statuses:

- `PAID`
- `CANCELLED`
- `DECLINED`
- `ERROR`

The script posts to:

```txt
${BASE_URL:-http://localhost:3000}/api/swish-callback
```

Important: the callback route currently requires `x-forwarded-for` to contain an allowed Swish IP. The mock script does not set that header, so it will be rejected by the current callback IP check unless the script or route is adjusted for local testing.

## Known Implementation Notes

These are not necessarily bugs, but they matter when developing or deploying.

### External payment fetch is currently stubbed

`app/action/external.ts` currently returns `temporaryPayment(ref)` for missing payments. The production fetch/upsert logic is present but commented out.

Before production use, replace the temporary path with the real external fetch helper from `lib/externalHandler.ts`. The commented production block currently refers to `fetchExternalPayment`; the implemented export in `lib/externalHandler.ts` is named `getExternalPayment`, so that wiring needs to be reconciled while removing the hard-coded test payment values.

### Callback IP check depends on proxy headers

`app/api/swish-callback/route.ts` reads the client IP from:

```txt
x-forwarded-for
```

If the deployment platform does not forward this header in the expected format, valid callbacks may be rejected. If the app is behind a proxy/CDN/load balancer, confirm how the original client IP is exposed.

### SSE is in-memory only

`lib/sse.ts` stores clients in a process-local `Map`.

This works for a single Node.js process. It is not enough for multiple instances, serverless fan-out, or horizontally scaled deployments. In that case, use shared pub/sub such as Redis, a database notification channel, or a queue.

### Timeout cancellation is local

`expirePaymentIfTimedOut` marks expired payments as `CANCELLED` locally. It does not call Swish cancellation. User-triggered cancellation does call Swish when `isCreated` is true.

Decide whether timeout should also cancel Swish-side payment requests.

### Logger truncation uses a Unicode ellipsis

Most source files are ASCII, but `lib/logger.ts` appends `…` when truncating. Keep this in mind if enforcing ASCII-only source files later.

### Prisma schema is split across files

The schema directory contains:

- `prisma/schema.prisma`
- `prisma/models/payment.prisma`
- `prisma/models/logging.prisma`

This relies on Prisma's schema folder support. Keep new models in the same schema directory structure.

### Prisma CLI and runtime use different database env shapes

Runtime uses separate host/user/password/database variables through `PrismaMariaDb`.

Prisma CLI uses `DATABASE_URL` through `prisma.config.ts`.

When migrations work but runtime fails, or runtime works but migrations fail, check both sets of environment variables.

### Metadata is still default

`app/layout.tsx` still has create-next-app metadata. Update it before production.

### `start/[ref]/page.tsx` prop type is inconsistent with newer App Router style

Some pages type `params` as a `Promise<{ ref: string }>` and await it. `app/start/[ref]/page.tsx` declares `params: { ref: string }` but still awaits it. This currently works in the code as written, but keep an eye on Next.js type expectations when upgrading.

## Common Change Recipes

### Enable real external payment loading

Files:

- `app/action/external.ts`
- `lib/externalHandler.ts`
- `docs/external-api-contract.md`

Steps:

1. Import the external fetch helper from `lib/externalHandler.ts`, reconciling the commented `fetchExternalPayment` name with the current `getExternalPayment` export.
2. Remove or bypass `temporaryPayment(ref)`.
3. Restore the commented fetch/upsert logic.
4. Ensure `SWISH_PAYEE_ALIAS`, `EXTERNAL_API_URL`, and `EXTERNAL_API_KEY` are configured.
5. Test `GET /start/:ref` with an existing external reference and a missing reference.

### Change the payment timeout

File:

- `lib/paymentTimeoutConfig.ts`

Change:

```ts
const PAYMENT_TIMEOUT_MS = 3 * 60 * 1000;
```

Then verify:

- Waiting page countdown.
- `/api/payment-status/:ref`.
- SSE expiry timer behavior.

### Add a new terminal status

Files:

- `prisma/models/payment.prisma`
- `lib/utils.ts`
- `app/status/[ref]/components/statusContent.ts`
- `app/api/swish-callback/types.ts`

Steps:

1. Add it to the Prisma enum.
2. Regenerate Prisma client.
3. Decide whether `isTerminalStatus` should include it.
4. Add final status content if it can reach `/status/:ref`.
5. Update callback typing if Swish can send it.

### Change Swish environment behavior

Files:

- `lib/swish.ts`
- `lib/swishPaymentHandler.ts`

Look at:

- required env validation in `lib/swish.ts`
- base URL mapping in `PaymentHandler.baseURL`
- API version choices in each Swish method

### Change callback authorization

File:

- `app/api/swish-callback/route.ts`

Relevant code:

- `ALLOWED_IP_RANGES`
- `ipv4ToNumber`
- `isIpAllowed`
- `x-forwarded-for` parsing in `POST`

When changing this, also update local mock/testing scripts.

## File Map

```txt
app/
  action/
    cancelPayment.ts           Server action for cancelling/syncing payment cancellation.
    external.ts                Server action for loading local/external payment data.
    getStatus.ts               Thin status action around payment expiry.
    startPayment.ts            Server action for starting Swish payment requests.
  api/
    payment-status/[ref]/      Polling/status endpoint.
    status-stream/             SSE endpoint.
    swish-callback/            Swish callback endpoint and callback types.
  generated/prisma/            Generated Prisma client output.
  start/[ref]/                 Start payment page and form components.
  status/[ref]/                Final status page and components.
  waiting/[ref]/               Waiting page and SSE client component.
  globals.css                  Tailwind/theme/view-transition styles.
  layout.tsx                   Root layout and theme provider.
  template.tsx                 App Router template.
  types/payment.ts             Prisma-derived payment type for UI props.

components/
  ThemeImage.tsx               Theme-aware image helper.
  ui/                          shadcn/ui primitives.

docs/
  external-api-contract.md     Contract for the external payment/order system.

lib/
  externalHandler.ts           External API fetch/status update helpers.
  logger.ts                    Database logger.
  paymentExpiry.ts             Timeout and expiry logic.
  paymentTimeoutConfig.ts      Timeout duration constant.
  prisma.ts                    Runtime Prisma client.
  sse.ts                       In-memory SSE client registry.
  swish.ts                     Swish singleton initialization.
  swishPaymentHandler.ts       Swish HTTPS API wrapper.
  utils.ts                     Shared class/status/format helpers.
  uuid.ts                      32-character uppercase hex ID generator.
  viewTransition.ts            Browser view-transition helper.

prisma/
  schema.prisma                Generator and datasource.
  models/
    payment.prisma             Payment model and enums.
    logging.prisma             Logger model and enum.

scripts/
  mock-swish-callback.sh       Manual callback helper.
```
