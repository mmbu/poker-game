FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose ports
EXPOSE 8080 8081

# Start server
CMD ["npm", "start"]
