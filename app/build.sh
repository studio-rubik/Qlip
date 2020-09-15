#!/bin/sh

if [ "$MEMBO_BUILD_ENV" = 'development' ]; then
  echo "Start building for development environment..."
  dotenv -e .env.development -e .env.development.server react-scripts build
elif [ "$MEMBO_BUILD_ENV" = 'production' ]; then
  echo "Start building for production environment..."
  react-scripts build
else
  echo "MEMBO_BUILD_ENV is not specified."
  exit 1
fi
