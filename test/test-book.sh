#!/usr/bin/env bash
# test-book.sh  "Passenger Name"

set -euo pipefail
FIFO_IN=/tmp/mcp.in; FIFO_OUT=/tmp/mcp.out
[[ -s /tmp/offer_id.txt ]] || { echo " Run test-search.sh first."; exit 1; }

PASSENGER=${1:-"Ashmita Pandey"}
OFFER_ID=$(< /tmp/offer_id.txt)

read -r -d '' REQ <<JSON
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{
  "name":"book_flight",
  "arguments":{"offer_id":"$OFFER_ID","passenger_name":"$PASSENGER"}
}}
JSON

printf '%s\n' "$REQ" >"$FIFO_IN"
read -r LINE <"$FIFO_OUT"
echo "🛫 Booking reply:"
echo "$LINE" | jq -r '.result.content[0].text // .error.message'