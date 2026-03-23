# External API Contract

This is the minimal API the Swish app needs from the external system.

Auth for both endpoints:

```http
Authorization: Bearer <EXTERNAL_API_KEY>
```

Base URL:

```txt
EXTERNAL_API_URL
```

## 1. Get payment/order by reference

The Swish app will call:

```http
GET /{reference}
```

Example:

```http
GET /ORDER-12345
Authorization: Bearer xxxxx
```

Expected JSON response:

```json
{
  "payer_alias": null,
  "amount": 100.10,
  "message": "Test payment",
  "redirect_url": "https://example.com/checkout/complete"
}
```

Field rules:
- `amount`: required number
- `message`: required string (max of 50 characters)
- `redirect_url`: required string URL (Url to your page that the user will be redirected to after payment)
- `payer_alias`: string or `null` (if you want to pre-fill the phone number in the Swish app, otherwise `null`)

If the reference does not exist:

```http
404 Not Found
```

```json
{
  "error": "Payment not found"
}
```

## 2. Receive payment status updates

The Swish app will call:

```http
POST /{reference}/status
Content-Type: application/json
Authorization: Bearer xxxxx
```

Example request body:

```json
{
  "status": "PAID"
}
```

Allowed status values:
- `INITIATED`
- `CREATED`
- `PAID`
- `ERROR`
- `DECLINED`
- `CANCELLED`

Success response:

```http
200 OK
```

```json
{
  "success": true
}
```

## Summary

He only needs to implement:
1. `GET /{reference}` returning `payer_alias`, `amount`, `message`, `redirect_url`
2. `POST /{reference}/status` accepting `{ "status": "..." }`
