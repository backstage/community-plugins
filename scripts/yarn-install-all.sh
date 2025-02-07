!# /bin/bash

find ./workspaces -maxdepth 1 -type d | tail -n +2 | xargs -I {} -P 10 sh -c 'cd "{}" && pwd && yarn install --mode=update-lockfile && yarn dedupe --mode=update-lockfile'
