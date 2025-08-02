#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "❌ Error: $*" >&2
  exit 1
}

get_latest_sha() {
  local node_version="$1"
  echo "🔍 Fetching latest sha256 for node:${node_version}-alpine..." >&2
  
  docker pull "node:${node_version}-alpine" >/dev/null 2>&1 || die "Failed to pull node:${node_version}-alpine"
  
  local sha256
  sha256=$(docker inspect --format='{{index .RepoDigests 0}}' "node:${node_version}-alpine" | cut -d@ -f2)
  
  [[ -z "$sha256" ]] && die "Could not determine sha256 for node:${node_version}-alpine"
  echo "$sha256"
}

update_dockerfile() {
  local node_version="$1"
  local sha256="$2"
  
  sed -i \
    -e "s|FROM node:[0-9]\+-alpine@sha256:[a-f0-9]\+|FROM node:${node_version}-alpine@${sha256}|g" \
    Dockerfile

  echo "✅ Updated Dockerfile to node:${node_version}-alpine@sha256:${sha256}"
}

main() {
  [[ $# -ne 1 ]] && die "Usage: $0 <node-version>"
  
  local node_version="$1"
  local sha256
  sha256=$(get_latest_sha "$node_version")
  
  update_dockerfile "$node_version" "$sha256"
}

main "$@"
