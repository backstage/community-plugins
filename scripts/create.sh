#!/bin/bash

printf "\033[1;34mEnter a name for the new workspace [required] \033[0m"
read -r name

printf "\033[1;34mWho are the codeowners (GitHub usernames) of the new workspace? [required] \033[0m"
read -r codeowners

WORKSPACE_PATH="workspaces/${name}"

echo $name | npx --yes @backstage/create-app --path $WORKSPACE_PATH --skip-install

jq --arg name "$name" '.name = $name' ${WORKSPACE_PATH}/package.json > ${WORKSPACE_PATH}/package.json.tmp && mv ${WORKSPACE_PATH}/package.json.tmp ${WORKSPACE_PATH}/package.json

echo "/${WORKSPACE_PATH} ${codeowners}" >> .github/CODEOWNERS
