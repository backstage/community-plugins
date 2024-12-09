#!/bin/bash

cd "$(dirname "$0")"/.. || exit 1

echo "Generating OpenAPI clients"

# iterate through the openapi directory and all it's children to
# generate the client on each .json spec file
for file in $(find openapi -name '*.json'); do
  echo "Generating client for $file OpenAPI spec"

  if [[ $file =~ openapi\/(.*).json ]]
  then
    name=${BASH_REMATCH[1]}
    # We must use axios over node-fetch because openapi-ts only supports node-fetch v3
    openapi-ts --input "./$file" --output "./src/generated/$name" -c axios
  fi
done
