#!/bin/sh
# Replace Stripe test secret with placeholder in specific files
SECRET="sk_test_51SlCuzQ6iyFQiyC7iB6fkktBH6Jizdj3qYel5YoWTJstnpiLMdBaQu0ZjBR3FJXI8miZvgp3J00UWQohdPcunxM300fZwwJ3p3"
PLACEHOLDER="REDACTED_STRIPE_TEST_KEY"

# Files to sanitize
FILES="STRIPE_INTEGRATION_COMPLETE.md STRIPE_READY_TO_USE.md backend-afghan-grocery/.env"

for f in $FILES; do
  if [ -f "$f" ]; then
    sed -i "s/$SECRET/$PLACEHOLDER/g" "$f" || true
  fi
done

# Also sanitize any other file containing the secret
# Use grep to find files and replace
if command -v grep >/dev/null 2>&1; then
  matches=$(grep -rl "$SECRET" || true)
  for m in $matches; do
    sed -i "s/$SECRET/$PLACEHOLDER/g" "$m" || true
  done
fi

exit 0
