#!/usr/bin/env bash
# =============================================================================
# build-all.sh — Build all versioned ML notebook images
#
# Usage:
#   ./build-all.sh              # Build all
#   ./build-all.sh minikube     # Build + load into Minikube
# =============================================================================

set -e  # exit on error

REGISTRY=${REGISTRY:-""}   # e.g. "123456789.dkr.ecr.us-east-1.amazonaws.com/" or ""
TARGET=${1:-"local"}

echo "🔨 Building ML Notebook images..."
echo "   Registry : ${REGISTRY:-local}"
echo "   Target   : ${TARGET}"
echo ""

build_and_tag() {
  local DOCKERFILE=$1
  local TAG=$2
  local FULL_TAG="${REGISTRY}${TAG}"

  echo "──────────────────────────────────────────"
  echo "📦 Building: ${FULL_TAG}"
  echo "   Dockerfile: ${DOCKERFILE}"
  docker build \
    --no-cache \
    -f "${DOCKERFILE}" \
    -t "${FULL_TAG}" \
    .

  # Also tag as latest if it's py311 (newest)
  if [[ "${TAG}" == *"py311"* ]]; then
    docker tag "${FULL_TAG}" "${REGISTRY}${TAG/py311/latest}"
    echo "   ✅ Also tagged as: ${REGISTRY}${TAG/py311/latest}"
  fi

  if [[ "${TARGET}" == "minikube" ]]; then
    echo "   📤 Loading into Minikube..."
    minikube image load "${FULL_TAG}"
  fi

  echo ""
}

# ── ML Standard ──────────────────────────────────────────────────────────────
build_and_tag "Dockerfile.py311"  "ml-notebook:py311"
build_and_tag "Dockerfile.py310"  "ml-notebook:py310"

echo "✅ All images built successfully!"
echo ""
echo "Available images:"
docker images | grep ml-notebook
