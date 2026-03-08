FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN cd backend && npm install --production
RUN cd frontend && npm install

# Copy source
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create workspace dir
RUN mkdir -p ./backend/workspace

EXPOSE 3001

CMD ["node", "backend/server.js"]
