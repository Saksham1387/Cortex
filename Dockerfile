# Use Bun as base image
FROM oven/bun:1.0-alpine

# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb (if exists)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Run Prisma migrations, generate client, and seed
CMD bunx prisma migrate dev && \
    bunx prisma generate && \
    bun run prisma/userQuery.ts && \
    tail -f /dev/null