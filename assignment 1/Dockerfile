FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY server.js ./
COPY public ./public

# Create necessary directories
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
