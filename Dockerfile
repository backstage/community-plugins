FROM node:20-bookworm-slim

WORKDIR /app

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY . .

WORKDIR /app/workspaces/agent-forge

RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]