#!/bin/bash

# Update the existing image with the contents of the deploy directory
oc start-build plugin-registry --from-dir=./dynamic-plugins-root --wait
