FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy server code
COPY server/ ./server/

EXPOSE 3000

CMD ["node", "server/index.js"]
