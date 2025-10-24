#!/bin/bash

set -e

IMAGE_NAME="ghcr.io/cnoe-io/backstage-plugin-agent-forge"
TAG="latest"

echo "🏗️  Building multi-architecture images for $IMAGE_NAME:$TAG"

# Build AMD64 image
echo "📦 Building AMD64 image..."
docker buildx build --platform linux/amd64 -t $IMAGE_NAME:$TAG-amd64 --push .

# Try to build ARM64 image (may fail due to native dependencies)
echo "📦 Attempting ARM64 image..."
if docker buildx build --platform linux/arm64 -t $IMAGE_NAME:$TAG-arm64 --push .; then
    echo "✅ ARM64 build successful"
    
    # Create multi-arch manifest
    echo "🔗 Creating multi-architecture manifest..."
    docker manifest create $IMAGE_NAME:$TAG \
        $IMAGE_NAME:$TAG-amd64 \
        $IMAGE_NAME:$TAG-arm64
    
    docker manifest annotate $IMAGE_NAME:$TAG $IMAGE_NAME:$TAG-amd64 --arch amd64
    docker manifest annotate $IMAGE_NAME:$TAG $IMAGE_NAME:$TAG-arm64 --arch arm64
    
    docker manifest push $IMAGE_NAME:$TAG
    
    echo "✅ Multi-architecture manifest created and pushed"
else
    echo "⚠️  ARM64 build failed, using AMD64 only"
    
    # Tag the AMD64 image as latest
    docker tag $IMAGE_NAME:$TAG-amd64 $IMAGE_NAME:$TAG
    docker push $IMAGE_NAME:$TAG
    
    echo "✅ AMD64 image tagged as latest"
fi

echo "🎉 Build complete!"
echo "   Image: $IMAGE_NAME:$TAG"
echo "   Available architectures: AMD64 $(docker manifest inspect $IMAGE_NAME:$TAG | grep -q arm64 && echo '+ ARM64' || echo 'only')"
