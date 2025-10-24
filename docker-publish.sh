#!/bin/bash

# Docker publish script for backstage-plugin-agent-forge

set -e

echo "🐳 Docker Multi-Architecture Build and Publish Script"
echo "=================================================="

# Check if required environment variables are set
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Please set your GitHub credentials:"
    echo "   export GITHUB_USERNAME=your_username"
    echo "   export GITHUB_TOKEN=your_personal_access_token"
    echo ""
    echo "   Your token needs 'write:packages' permission"
    exit 1
fi

echo "✅ Environment variables found"

# Login to GitHub Container Registry
echo "🔐 Logging into GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

if [ $? -eq 0 ]; then
    echo "✅ Successfully logged into ghcr.io"
else
    echo "❌ Failed to login to ghcr.io"
    exit 1
fi

# Build and publish
echo "🏗️  Building and publishing AMD64 image..."
make publish

if [ $? -eq 0 ]; then
    echo "✅ Successfully published ghcr.io/cnoe-io/backstage-plugin-agent-forge:latest (AMD64)"
    echo ""
    echo "🎉 Image published successfully!"
    echo "   You can now pull it with:"
    echo "   docker pull ghcr.io/cnoe-io/backstage-plugin-agent-forge:latest"
else
    echo "❌ Failed to publish image"
    exit 1
fi

# Optional: Try multi-arch build
echo ""
read -p "🤔 Would you like to try building multi-architecture (AMD64 + ARM64)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Attempting multi-architecture build..."
    make publish-multi
    
    if [ $? -eq 0 ]; then
        echo "✅ Multi-architecture build successful!"
    else
        echo "⚠️  Multi-architecture build failed (ARM64 issues), but AMD64 version is available"
    fi
fi

echo ""
echo "🎯 Summary:"
echo "   - AMD64 image: ✅ Available"
echo "   - Image: ghcr.io/cnoe-io/backstage-plugin-agent-forge:latest"
echo "   - Registry: GitHub Container Registry (ghcr.io)"
