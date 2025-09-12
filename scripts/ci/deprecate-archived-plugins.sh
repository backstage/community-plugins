#!/bin/bash

set -e

# Get script directory and archived file path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVED_FILE="$(dirname "$(dirname "$SCRIPT_DIR")")/.github/archived-plugins.json"

# Check if dry run (first argument)
DRY_RUN=${1:-false}

if [[ "$DRY_RUN" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "DRY RUN MODE"
else
    DRY_RUN=false
fi

echo "Processing archived packages..."

# Extract unique plugins from archived-plugins.json file
# Format: package_name|workspace|plugin|reason
jq -r '
  .archived 
  | unique_by(.pluginName) 
  | .[] 
  | "\(.pluginName)|\(.workspace)|\(.plugin)|\(.reason)"
' "$ARCHIVED_FILE" | while IFS='|' read -r package_name workspace plugin reason; do

    # Check if already deprecated
    if npm view "$package_name" deprecated 2>/dev/null | grep -q "true\|deprecated"; then
        echo "Already deprecated: $package_name"
        continue
    fi
    # Generate deprecation message
    message="This package has been archived from the backstage/community-plugins repository"
    [[ -n "$plugin" ]] && message="$message (plugin: $plugin)"
    [[ -n "$reason" ]] && message="$message. Reason: $reason"
    message="$message."

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would deprecate: $package_name"
        echo "    Message: $message"
    else
        echo "Deprecating: $package_name"

        # Validate package exists and is accessible before deprecating
        if ! npm view "$package_name" version &>/dev/null; then
            echo "Error: Cannot view package $package_name"
            continue
        fi

        echo "Running: npm deprecate $package_name \"$message\""
        npm deprecate "$package_name" "$message"
        echo "Done: $package_name"
    fi
done

echo "Complete!"