#!/bin/bash

# Dookan Docker Deployment Script
# This script helps you deploy Dookan using Docker

set -e

echo "======================================"
echo "Dookan Docker Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed (v1 or v2)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Use docker compose (v2) if available, otherwise use docker-compose (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating .env file from .env.docker.example..."
    cp .env.docker.example .env
    echo -e "${YELLOW}Please edit .env file and add your configuration${NC}"
    echo "Press Enter to continue after editing .env file..."
    read
fi

# Ask for deployment mode
echo "Select deployment mode:"
echo "1) Development (docker-compose.yml)"
echo "2) Production (docker-compose.prod.yml)"
read -p "Enter your choice (1 or 2): " mode

COMPOSE_FILE="docker-compose.yml"
if [ "$mode" = "2" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "${YELLOW}Using production configuration${NC}"
    
    # Check if required production env vars are set with sufficient length
    if ! grep -E "^JWT_SECRET=.{20,}" .env || ! grep -E "^JWT_REFRESH_SECRET=.{20,}" .env || ! grep -E "^CORS_ORIGIN=.{5,}" .env; then
        echo -e "${RED}Error: Required production environment variables not set or too short${NC}"
        echo "Please ensure:"
        echo "  - JWT_SECRET is set and at least 20 characters long"
        echo "  - JWT_REFRESH_SECRET is set and at least 20 characters long"
        echo "  - CORS_ORIGIN is configured with your production domain"
        exit 1
    fi
else
    echo -e "${GREEN}Using development configuration${NC}"
fi

echo ""

# Ask what to do
echo "What would you like to do?"
echo "1) Build and start services"
echo "2) Stop services"
echo "3) Stop and remove all data (volumes)"
echo "4) View logs"
echo "5) Rebuild and restart services"
read -p "Enter your choice (1-5): " action

case $action in
    1)
        echo -e "${GREEN}Building and starting services...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE up -d --build
        echo ""
        echo -e "${GREEN}✓ Services started successfully!${NC}"
        echo ""
        echo "Access your application at:"
        echo "  Frontend: http://localhost"
        echo "  Backend API: http://localhost:3000"
        echo ""
        echo "View logs with: $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f"
        ;;
    2)
        echo -e "${YELLOW}Stopping services...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    3)
        echo -e "${RED}WARNING: This will delete all data including database and uploads!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            $DOCKER_COMPOSE -f $COMPOSE_FILE down -v
            echo -e "${GREEN}✓ Services stopped and data removed${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    4)
        echo -e "${GREEN}Showing logs (Ctrl+C to exit)...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f
        ;;
    5)
        echo -e "${YELLOW}Rebuilding and restarting services...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE down
        $DOCKER_COMPOSE -f $COMPOSE_FILE up -d --build --force-recreate
        echo -e "${GREEN}✓ Services rebuilt and restarted${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "Deployment complete!"
echo "======================================"
