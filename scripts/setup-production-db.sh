#!/bin/bash
# Production Database Setup Script
# Run this after creating your production Supabase project

set -e  # Exit on error

echo "🚀 Pulau Production Database Setup"
echo "===================================="
echo ""

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL not provided"
  echo ""
  echo "Usage:"
  echo "  DATABASE_URL='your-connection-string' ./scripts/setup-production-db.sh"
  echo ""
  echo "Get your connection string from:"
  echo "  Supabase Dashboard → Settings → Database → Connection String (URI)"
  echo ""
  exit 1
fi

echo "📊 Found $(ls supabase/migrations/*.sql | wc -l | xargs) migration files"
echo ""

# Confirm before proceeding
read -p "⚠️  This will run ALL migrations on PRODUCTION. Continue? (yes/no) " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "❌ Aborted by user"
  exit 0
fi

echo "🔄 Running migrations..."
echo ""

# Run each migration in order
for migration in supabase/migrations/*.sql; do
  filename=$(basename "$migration")
  echo "▶️  Applying: $filename"
  
  # Use psql to run the migration
  psql "$DATABASE_URL" -f "$migration" -v ON_ERROR_STOP=1
  
  if [ $? -eq 0 ]; then
    echo "✅ Success: $filename"
  else
    echo "❌ Failed: $filename"
    exit 1
  fi
  echo ""
done

echo "✨ All migrations completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify schema in Supabase Dashboard → Database → Tables"
echo "  2. Test RLS policies"
echo "  3. Get your Supabase URL and anon key for environment variables"
echo ""
