#!/bin/bash

pushd ./workspaces

npx --yes @backstage/create-app

popd

# customize name of the project
# make the setup correct
# skip yarn install