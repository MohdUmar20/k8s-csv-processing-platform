#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-csv-processor}"

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
kubectl -n "${NAMESPACE}" create secret generic aws-credentials \
  --from-file=credentials="${HOME}/.aws/credentials" \
  --from-file=config="${HOME}/.aws/config" \
  --dry-run=client -o yaml | kubectl apply -f -

