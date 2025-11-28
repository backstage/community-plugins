#!/bin/bash

backstageVersion=$(jq -r '.version' backstage.json)
createAppVersion=$(curl "https://raw.githubusercontent.com/backstage/backstage/refs/tags/v${backstageVersion}/packages/create-app/package.json" -s | jq -r '.version')

echo "Backstage version is: ${backstageVersion}, corresponding create-app version is: ${createAppVersion}"
echo "example" | npx "@backstage/create-app@${createAppVersion}"

appconfig=app-config.yaml
appProductionConfig=app-config.production.yaml
if [ ! -d examples ]; then
  echo "Copy 'examples' directory from generated 'example' app"
  cp -r example/examples .
fi

if [ ! -f ${appconfig} ]; then
  echo "Copy ${appconfig} from generated 'example' app"
  cp -r example/${appconfig} .
fi

if [ ! -f ${appProductionConfig} ]; then
  echo "Copy ${appProductionConfig} from generated 'example' app"
  cp -r example/${appProductionConfig} .
fi

echo "Copy 'packages' from generated 'example' app"
cp -rf example/packages .

echo "Remove 'example' app directory"
rm -rf example

echo "update yarn.lock in the current yarn workspace"
yarn && yarn install