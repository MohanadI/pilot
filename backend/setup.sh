#!/bin/bash

# Pilot Backend Setup Script
echo "🚀 Setting up Pilot Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads/invoices
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PostgreSQL is installed
echo "🔍 Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
else
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "   Or use a cloud service like AWS RDS, Google Cloud SQL, etc."
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOL
# Server Configuration
NODE_ENV=development
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pilot_invoices
DB_USERNAME=postgres
DB_PASSWORD=password
DB_SSL=false

# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=http://localhost:5678/webhook/invoice-processing

# OpenAI Configuration (required for AI extraction)
OPENAI_API_KEY=your_openai_api_key_here

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_VERIFY_TOKEN=pilot_whatsapp_verify
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here

# Security
JWT_SECRET=your_jwt_secret_here
LOG_LEVEL=info
EOL
    echo "✅ .env file created. Please update with your actual API keys."
else
    echo "✅ .env file already exists"
fi

# Check if n8n is installed globally
echo "🔍 Checking n8n installation..."
if ! command -v n8n &> /dev/null; then
    echo "📦 Installing n8n globally..."
    npm install -g n8n
else
    echo "✅ n8n is already installed"
fi

echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your API keys and database credentials"
echo "2. Start PostgreSQL: brew services start postgresql (macOS) or sudo systemctl start postgresql (Ubuntu)"
echo "3. Create database: createdb pilot_invoices"
echo "4. Start n8n: n8n start (in a separate terminal)"
echo "5. Import n8n workflows from docs/n8n-workflows/"
echo "6. Start the backend: npm run dev"
echo ""
echo "API will be available at: http://localhost:3001"
echo "n8n will be available at: http://localhost:5678"
echo ""
echo "For detailed instructions, see: BACKEND_WORKFLOW_GUIDE.md"
