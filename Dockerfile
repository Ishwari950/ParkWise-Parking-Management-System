FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ARG GIT_SHA=local
ENV GIT_SHA=$GIT_SHA
ENV PORT=3000
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]