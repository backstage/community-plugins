#!/bin/bash
# Default command
DEFAULT_COMMAND="pwd"

# Use provided command or default
if [ "$#" -eq 0 ]; then
    COMMAND=$DEFAULT_COMMAND
else
    COMMAND="$@"
fi
echo "Running command: $COMMAND"

# Export the command so it's available in the subshells
export COMMAND

find ./workspaces -maxdepth 1 -type d | tail -n +2 | xargs -I {} -P 3 sh -c 'cd "{}" && pwd && eval "$COMMAND"'
