#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: bash scripts/mock-swish-callback.sh <payment-id> <payee-payment-reference> [status]"
  echo
  echo "Example:"
  echo "  bash scripts/mock-swish-callback.sh 0902D12C7FAE43D3AAAC49622AA79FEF 1234567890 PAID"
  exit 1
fi

PAYMENT_ID="$1"
PAYEE_PAYMENT_REFERENCE="$2"
STATUS="${3:-PAID}"

BASE_URL="${BASE_URL:-http://localhost:3000}"
PAYMENT_REFERENCE="${PAYMENT_REFERENCE:-MOCKPAYMENTREF1234567890}"
CALLBACK_URL="${CALLBACK_URL:-https://example.com/api/swish-callback}"
PAYER_ALIAS="${PAYER_ALIAS:-46701234567}"
PAYEE_ALIAS="${PAYEE_ALIAS:-1231181189}"
AMOUNT="${AMOUNT:-100}"
CURRENCY="${CURRENCY:-SEK}"
MESSAGE="${MESSAGE:-Mock Swish callback}"
ERROR_CODE="${ERROR_CODE:-null}"
ERROR_MESSAGE="${ERROR_MESSAGE:-null}"
DATE_CREATED="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

case "$STATUS" in
  PAID)
    DATE_PAID_JSON="\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""
    ;;
  CANCELLED|DECLINED|ERROR)
    DATE_PAID_JSON="null"
    ;;
  *)
    echo "Unsupported status: $STATUS"
    echo "Supported statuses: PAID, CANCELLED, DECLINED, ERROR"
    exit 1
    ;;
esac

curl -i -X POST "${BASE_URL}/api/swish-callback" \
  -H "Content-Type: application/json" \
  --data "{
    \"id\": \"${PAYMENT_ID}\",
    \"payeePaymentReference\": \"${PAYEE_PAYMENT_REFERENCE}\",
    \"paymentReference\": \"${PAYMENT_REFERENCE}\",
    \"callbackUrl\": \"${CALLBACK_URL}\",
    \"payerAlias\": \"${PAYER_ALIAS}\",
    \"payeeAlias\": \"${PAYEE_ALIAS}\",
    \"amount\": ${AMOUNT},
    \"currency\": \"${CURRENCY}\",
    \"message\": \"${MESSAGE}\",
    \"status\": \"${STATUS}\",
    \"dateCreated\": \"${DATE_CREATED}\",
    \"datePaid\": ${DATE_PAID_JSON},
    \"errorCode\": ${ERROR_CODE},
    \"errorMessage\": ${ERROR_MESSAGE}
  }"
