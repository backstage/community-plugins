#!/bin/bash
pwd
set -ex

# Generate doc
openapi-generator-cli generate -i ./src/schema/openapi.yaml -g markdown -o ./api-docs/
