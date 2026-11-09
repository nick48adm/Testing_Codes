
#!/usr/bin/env bash

set -Eeuo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <URL> [duration]"
    echo "Example: $0 https://example.com 60s"
    exit 1
fi

URL="$1"
DURATION="${2:-60s}"

RATE="${RATE:-20000}"
TIMEOUT="${TIMEOUT:-10s}"
RESULTS="vegeta-results-$(date +%Y%m%d-%H%M%S).bin"

if ! command -v vegeta >/dev/null 2>&1; then
    echo "Error: Vegeta is not installed."
    exit 1
fi

if [[ ! "$URL" =~ ^https?:// ]]; then
    echo "Error: URL must start with http:// or https://"
    exit 1
fi

TARGETS=$(mktemp)
trap 'rm -f "$TARGETS"' EXIT

printf 'GET %s\n' "$URL" > "$TARGETS"

echo "================================"
echo "       LOAD TEST STARTING"
echo "================================"
echo "Target      : $URL"
echo "Rate        : $RATE requests/sec"
echo "Duration    : $DURATION"
echo "Timeout     : $TIMEOUT"
echo "================================"

vegeta attack \
    -targets="$TARGETS" \
    -rate="${RATE}/s" \
    -duration="$DURATION" \
    -timeout="$TIMEOUT" \
    -workers=50 \
    -max-workers=500 \
    -output="$RESULTS"

echo
echo "========== TEST REPORT =========="

vegeta report "$RESULTS"

echo
echo "========== LATENCY HISTOGRAM =========="

vegeta report \
    -type='hist[0,10ms,50ms,100ms,250ms,500ms,1s,2s]' \
    "$RESULTS"

echo
echo "Results saved to: $RESULTS"
