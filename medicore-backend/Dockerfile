# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all backend code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]