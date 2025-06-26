#!/usr/bin/env bash

set -euo pipefail
ORIGIN=${1:-SFO}; DEST=${2:-LAX}; DATE=${3:-$(date +%F)}
FIFO_IN=/tmp/mcp.in; FIFO_OUT=/tmp/mcp.out

mkdir -p /tmp 2>/dev/null
[[ -p $FIFO_IN && -p $FIFO_OUT ]] || { rm -f "$FIFO_IN" "$FIFO_OUT"; mkfifo "$FIFO_IN" "$FIFO_OUT"; }

exec 3<"$FIFO_OUT"
pgrep -f 'node build/index.js' >/dev/null || {
  NODE_ENV=prod node build/index.js <"$FIFO_IN" >"$FIFO_OUT" 2>>/tmp/mcp.log &
  sleep 1
}

read -r -d '' REQ <<JSON
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{
  "name":"search_flights",
  "arguments":{"origin":"$ORIGIN","destination":"$DEST","date":"$DATE"}
}}
JSON

printf '%s\n' "$REQ" >"$FIFO_IN"
read -r LINE <"$FIFO_OUT"

echo " Top-5 offers:"
echo "$LINE" | jq -r '.result.content[].text'
OFFER_ID=$(echo "$LINE" | jq -r '.result.content[0].text' | awk '/ {print $2}')
[[ -z $OFFER_ID || $OFFER_ID == null ]] && { echo " No offers."; exit 1; }
echo "$OFFER_ID" >/tmp/offer_id.txt
echo " Saved → $OFFER_ID"