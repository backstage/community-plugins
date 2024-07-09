#!/bin/bash
pwd
set -e

GENERATED_FOLDER="./src/generated"
OPENAPI_SPEC_FILE="./src/openapi/openapi.yaml"
API_FOLDER="${GENERATED_FOLDER}/api"
DEFINITION_FILE="${API_FOLDER}/definition.ts"
METADATA_FILE="${GENERATED_FOLDER}/.METADATA.sha1"
CLIENT_FOLDER="${GENERATED_FOLDER}/client"

openapi_generate() {
    # TypeScript Client generation
    openapi-ts --input ${OPENAPI_SPEC_FILE} --output ${CLIENT_FOLDER}

    # Workaround to temporarly ignore SonarCloud super-linear runtime vulnerability warning
    REQ_FILE="${CLIENT_FOLDER}"/core/request.ts
    TMPFILE=$(mktemp)
    awk '/\/{\(.*?\)}\/g/ {print $0 " // NOSONAR"} !/\/{\(.*?\)}\/g/ {print}' "${REQ_FILE}" > ${TMPFILE} && mv ${TMPFILE} "${REQ_FILE}"

    # Docs generation
    npx --yes @openapitools/openapi-generator-cli@v2.7.0 generate -g asciidoc -i ./src/openapi/openapi.yaml -o ./src/generated/docs/index.adoc
    
    npx --yes --package=js-yaml-cli@0.6.0 -- yaml2json -f ${OPENAPI_SPEC_FILE}

    OPENAPI_SPEC_FILE_JSON=$(tr -d '[:space:]' < "$(dirname $OPENAPI_SPEC_FILE)"/openapi.json)
    mkdir -p ${API_FOLDER}
    cat << EOF > ${DEFINITION_FILE}
/* eslint-disable */
/* prettier-ignore */
// GENERATED FILE DO NOT EDIT.
const OPENAPI = \`${OPENAPI_SPEC_FILE_JSON}\`;
export const openApiDocument = JSON.parse(OPENAPI);
EOF

    rm ./src/openapi/openapi.json
    yarn openapi:prettier:fix
    NEW_SHA=$(openapi_checksum)
    openapi_update "${NEW_SHA}"
}

openapi_checksum() {
    export CONCATENATED_CONTENT=$(cat ${DEFINITION_FILE} ${OPENAPI_SPEC_FILE})
    node -e $'console.log(crypto.createHash("sha1").update(`${process.env.CONCATENATED_CONTENT}`).digest("hex"))'
}

openapi_update() {
   echo "${1}" > "${METADATA_FILE}"
}

# Function to check if OpenAPI files are up-to-date
openapi_check() {

    if [ ! -f "${METADATA_FILE}" ]; then
        echo "Error: Metadata file '${METADATA_FILE}' not found. Run 'yarn openapi:generate' first."
        exit 1
    else
        STORED_SHA1=$(cat "${METADATA_FILE}")
    fi

    # Generate new SHA-1 checksum
    NEW_SHA1=$(openapi_checksum)

    # Check if the stored and current SHA-1 checksums differ
    if [ "${STORED_SHA1}" != "${NEW_SHA1}" ]; then
        echo "Changes detected in generated files or openapi.yaml. Please run 'yarn openapi:generate' to update."
        exit 1
    else
        echo "No changes detected in generated files or openapi.yaml. generated files are up to date."
    fi
}

# Check the command passed as an argument
case "$1" in
  "generate")
    openapi_generate
    ;;
  "check")
    openapi_check
    ;;
  *)
    echo "Error: Invalid command. Please use \"${0} generate\" to generate OpenAPI files or \"${0} check\" to verify their status."
    exit 1
    ;;
esac
