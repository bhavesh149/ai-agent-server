#!/bin/bash

# PM2 Management Script for AI Agent
# This script helps manage both ChromaDB and AI Agent services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Please install it first:"
        echo "npm install -g pm2"
        exit 1
    fi
}

# Function to activate Python virtual environment
activate_venv() {
    if [ -d "chromadb-venv" ]; then
        print_status "Activating Python virtual environment..."
        source chromadb-venv/bin/activate
    else
        print_warning "Python virtual environment not found. ChromaDB might not work properly."
    fi
}

# Function to start services
start_services() {
    print_status "Starting AI Agent services..."
    
    # Activate virtual environment
    activate_venv
    
    # Start services using PM2
    pm2 start ecosystem.config.cjs
    
    print_success "Services started successfully!"
    pm2 status
}

# Function to stop services
stop_services() {
    print_status "Stopping AI Agent services..."
    pm2 stop all
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting AI Agent services..."
    
    # Activate virtual environment
    activate_venv
    
    pm2 restart all
    print_success "Services restarted successfully!"
    pm2 status
}

# Function to check service status
check_status() {
    print_status "AI Agent Service Status:"
    pm2 status
    
    echo ""
    print_status "Service Health Checks:"
    
    # Check ChromaDB
    if curl -s http://localhost:8000/api/v1/version &> /dev/null; then
        print_success "ChromaDB is running on port 8000"
    else
        print_error "ChromaDB is not responding on port 8000"
    fi
    
    # Check AI Agent
    if curl -s http://localhost:3000/agent/health &> /dev/null; then
        print_success "AI Agent is running on port 3000"
    else
        print_error "AI Agent is not responding on port 3000"
    fi
}

# Function to view logs
view_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        pm2 logs
    else
        print_status "Showing logs for $service..."
        pm2 logs "$service"
    fi
}

# Function to monitor services
monitor_services() {
    print_status "Opening PM2 monitoring dashboard..."
    pm2 monit
}

# Function to setup services for first time
setup_services() {
    print_status "Setting up AI Agent services for first time..."
    
    # Check if ecosystem.config.cjs exists
    if [ ! -f "ecosystem.config.cjs" ]; then
        print_error "ecosystem.config.cjs not found in current directory"
        exit 1
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Activate virtual environment
    activate_venv
    
    # Start services
    pm2 start ecosystem.config.cjs
    
    # Setup PM2 to start on boot
    print_status "Setting up PM2 to start on boot..."
    pm2 startup
    pm2 save
    
    print_success "Setup completed successfully!"
    print_status "Don't forget to run the startup command shown above with sudo"
}

# Function to deploy updates
deploy_update() {
    print_status "Deploying updates..."
    
    # Build the project
    print_status "Building TypeScript project..."
    npm run build
    
    # Restart services
    restart_services
    
    print_success "Update deployed successfully!"
}

# Function to backup data
backup_data() {
    local backup_date=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups"
    
    print_status "Creating backup..."
    
    mkdir -p "$backup_dir"
    
    # Backup ChromaDB data
    if [ -d "chroma_data" ]; then
        tar -czf "$backup_dir/chroma_data_$backup_date.tar.gz" chroma_data/
        print_success "ChromaDB data backed up to $backup_dir/chroma_data_$backup_date.tar.gz"
    fi
    
    # Backup configuration files
    if [ -f ".env" ]; then
        cp .env "$backup_dir/.env_$backup_date"
        print_success "Environment file backed up to $backup_dir/.env_$backup_date"
    fi
    
    if [ -f "ecosystem.config.js" ]; then
        cp ecosystem.config.js "$backup_dir/ecosystem.config_$backup_date.js"
        print_success "PM2 config backed up to $backup_dir/ecosystem.config_$backup_date.js"
    fi
}

# Function to show help
show_help() {
    echo "AI Agent PM2 Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services" 
    echo "  restart     Restart all services"
    echo "  status      Check service status and health"
    echo "  logs        View logs for all services"
    echo "  logs <name> View logs for specific service"
    echo "  monitor     Open PM2 monitoring dashboard"
    echo "  setup       First-time setup (includes PM2 startup config)"
    echo "  deploy      Deploy updates (build + restart)"
    echo "  backup      Create backup of data and configuration"
    echo "  help        Show this help message"
    echo ""
    echo "Service Names:"
    echo "  - chromadb-server"
    echo "  - ai-agent-server"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs ai-agent-server"
    echo "  $0 status"
}

# Main script logic
check_pm2

case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs "$2"
        ;;
    monitor)
        monitor_services
        ;;
    setup)
        setup_services
        ;;
    deploy)
        deploy_update
        ;;
    backup)
        backup_data
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
