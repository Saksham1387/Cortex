# setup.sh - Run PostgreSQL in Docker and set up database with Prisma

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5
until docker-compose exec postgres pg_isready -U docker -d myapp; do
  echo "PostgreSQL is not ready yet... waiting"
  sleep 2
done

echo "PostgreSQL is ready."

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://docker:docker@localhost:5432/myapp"
echo "Set DATABASE_URL: $DATABASE_URL"

# Run Prisma migrations and seeding
echo "Running Prisma migrations..."
bunx prisma migrate dev

echo "Generating Prisma client..."
bunx prisma generate

echo "Seeding database..."
bun run prisma/userQuery.ts

echo "Setup complete! PostgreSQL is running in the background."
echo "To stop the container, run: docker-compose down"