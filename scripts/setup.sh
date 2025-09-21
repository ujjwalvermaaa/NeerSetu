#!/bin/bash

# NeerSetu Setup Script
# This script sets up the complete NeerSetu project

set -e

echo "🚀 Setting up NeerSetu - Smart Community Health Monitoring System"
echo "=================================================================="

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+ and try again."
        exit 1
    fi
    
    # Check MongoDB
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed. Please install MongoDB and start it before running the application."
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi
    
    print_success "System requirements check completed"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    if [ ! -f package.json ]; then
        print_error "Backend package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    cp env.example .env
    
    print_success "Backend setup completed"
    cd ..
}

# Install ML service dependencies
setup_ml_service() {
    print_status "Setting up ML service..."
    
    cd ml-service
    
    if [ ! -f requirements.txt ]; then
        print_error "ML service requirements.txt not found. Please run this script from the project root."
        exit 1
    fi
    
    python3 -m pip install -r requirements.txt
    
    # Create models directory
    mkdir -p models
    
    print_success "ML service setup completed"
    cd ..
}

# Install IoT simulator dependencies
setup_iot_simulator() {
    print_status "Setting up IoT simulator..."
    
    cd iot-simulator
    
    if [ ! -f requirements.txt ]; then
        print_error "IoT simulator requirements.txt not found. Please run this script from the project root."
        exit 1
    fi
    
    python3 -m pip install -r requirements.txt
    
    print_success "IoT simulator setup completed"
    cd ..
}

# Install mobile app dependencies
setup_mobile_app() {
    print_status "Setting up mobile app..."
    
    cd mobile-app
    
    if [ ! -f package.json ]; then
        print_error "Mobile app package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    
    print_success "Mobile app setup completed"
    cd ..
}

# Install dashboard dependencies
setup_dashboard() {
    print_status "Setting up dashboard..."
    
    cd dashboard
    
    if [ ! -f package.json ]; then
        print_error "Dashboard package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    
    print_success "Dashboard setup completed"
    cd ..
}

# Install alert service dependencies
setup_alerts_service() {
    print_status "Setting up alerts service..."
    
    cd alerts-service
    
    if [ ! -f package.json ]; then
        print_error "Alerts service package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    cp .env.example .env
    
    print_success "Alerts service setup completed"
    cd ..
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/neersetu
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
ALERTS_SERVICE_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
EOF
        print_success "Created backend/.env"
    fi
    
    # ML Service .env
    if [ ! -f ml-service/.env ]; then
        cat > ml-service/.env << EOF
BACKEND_URL=http://localhost:5000
MODEL_PATH=./models/outbreak_model.joblib
EOF
        print_success "Created ml-service/.env"
    fi
    
    # IoT Simulator .env
    if [ ! -f iot-simulator/.env ]; then
        cat > iot-simulator/.env << EOF
BACKEND_URL=http://localhost:5000
DATASET_PATH=../Datasets/2_Water_Quality_Data_NE_India.csv
EOF
        print_success "Created iot-simulator/.env"
    fi
    
    # Alerts Service .env
    if [ ! -f alerts-service/.env ]; then
        cat > alerts-service/.env << EOF
MONGODB_URI=mongodb://localhost:27017/neersetu
BACKEND_URL=http://localhost:5000
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
WHATSAPP_TOKEN=your_whatsapp_business_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
EOF
        print_success "Created alerts-service/.env"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p ml-service/models
    mkdir -p ml-service/logs
    mkdir -p iot-simulator/logs
    mkdir -p alerts-service/logs
    mkdir -p mobile-app/assets/fonts
    mkdir -p mobile-app/assets/images
    mkdir -p mobile-app/assets/icons
    
    print_success "Directories created"
}

# Train ML model
train_ml_model() {
    print_status "Training ML model..."
    
    cd ml-service
    
    # Check if dataset exists
    if [ ! -f "../Datasets/2_Water_Quality_Data_NE_India.csv" ]; then
        print_warning "Water quality dataset not found. Please ensure the dataset is in the Datasets folder."
        cd ..
        return
    fi
    
    # Train the model
    python3 -c "
import sys
sys.path.append('src')
from ml_pipeline import MLPipeline
import os

pipeline = MLPipeline()
result = pipeline.train_model('../Datasets/2_Water_Quality_Data_NE_India.csv', 'outbreak_model')
print('Model training result:', result)
"
    
    print_success "ML model training completed"
    cd ..
}

# Main setup function
main() {
    echo
    print_status "Starting NeerSetu setup process..."
    echo
    
    # Check requirements
    check_requirements
    
    # Create directories
    create_directories
    
    # Create environment files
    create_env_files
    
    # Setup each service
    setup_backend
    setup_ml_service
    setup_iot_simulator
    setup_mobile_app
    setup_dashboard
    setup_alerts_service
    
    # Train ML model
    train_ml_model
    
    echo
    print_success "🎉 NeerSetu setup completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Start MongoDB: mongod"
    echo "2. Start backend: cd backend && npm start"
    echo "3. Start ML service: cd ml-service && python3 src/api.py"
    echo "4. Start dashboard: cd dashboard && npm start"
    echo "5. Start mobile app: cd mobile-app && expo start"
    echo "6. Start IoT simulator: cd iot-simulator && python3 iot_simulator.py"
    echo "7. Start alerts service: cd alerts-service && npm start"
    echo
    print_warning "Don't forget to configure your API keys in the .env files!"
    echo
}

# Run main function
main "$@"
