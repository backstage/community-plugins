#!/usr/bin/env bash

# bail on error
set -e
# print each command
set -x

# e.g.
# v0.6.0 for a tag
# v0.6.0-1-gf0a2b3c for some non-tagged commit
NEW_VERSION=$(git describe --always --tags --match "v*")

# npm requires that leading v to be stripped to be "valid semver"
# e.g. 0.6.0
STRIPPED_NEW_VERSION=$(echo $NEW_VERSION | sed -e 's/^v//')

yarn clean
yarn tsc
yarn build

# don't git commit or push
yarn publish --new-version $STRIPPED_NEW_VERSION --no-git-tag-version
