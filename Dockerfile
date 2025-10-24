FROM node:20-bookworm-slim

WORKDIR /app

# Install git and python3 for native dependencies
RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy the entire project (needed for Yarn workspace setup)
COPY . .

WORKDIR /app/workspaces/agent-forge

# Install dependencies with retry and fallback
RUN yarn install --network-timeout 300000 || yarn install --network-timeout 300000 --ignore-engines

EXPOSE 3000

CMD ["yarn", "start"]