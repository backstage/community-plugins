# Makefile

# Variables
DOCKER_IMAGE = ghcr.io/cnoe-io/backstage-plugin-agent-forge:latest
DOCKER_PLATFORMS = linux/amd64,linux/arm64

# Targets
.PHONY: build publish

build:
	docker buildx build --platform $(DOCKER_PLATFORMS) -t $(DOCKER_IMAGE) .

publish:
	docker buildx build --platform $(DOCKER_PLATFORMS) -t $(DOCKER_IMAGE) --push .

build-push: build publish
	@echo "Build and push completed successfully."