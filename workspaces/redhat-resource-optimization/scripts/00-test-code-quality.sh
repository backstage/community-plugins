#!/bin/bash

echo "yarn install"
yarn install

echo "yarn tsc:full"
yarn tsc:full

echo "yarn lint"
yarn lint

echo "yarn prettier:check"
yarn run -T prettier --check plugins/redhat-resource-optimization*

echo "yarn test:all"
yarn test:all
