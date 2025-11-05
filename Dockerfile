FROM node:20-alpine

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY scripts ./scripts
COPY workspaces/agent-forge ./workspaces/agent-forge
COPY workspaces/repo-tools ./workspaces/repo-tools

RUN sed -i '/yarnPath:/d' .yarnrc.yml
RUN yarn install

WORKDIR /app/workspaces/agent-forge
RUN yarn install

# Clean up to reduce image size
RUN rm -rf /root/.cache /root/.yarn /tmp/* && \
    find /app -name "*.test.*" -delete && \
    find /app -name "*.spec.*" -delete && \
    find /app -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find /app -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true

EXPOSE 3000

CMD ["yarn", "start"]
