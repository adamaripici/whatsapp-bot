# Use a Puppeteer-friendly base image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy code
COPY . .

# Install dependencies
RUN npm install

# Default command
CMD ["node", "bot.js"]
