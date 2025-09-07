# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Server Configuration
```
NODE_ENV=development
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### Database (PostgreSQL)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pilot_invoices
DB_USERNAME=postgres
DB_PASSWORD=password
DB_SSL=false
```

### n8n Configuration
```
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
N8N_WEBHOOK_URL=http://localhost:5678/webhook/invoice-processing
```

### WhatsApp Business API Configuration
```
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_VERIFY_TOKEN=pilot_whatsapp_verify
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp-message
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
```

### OpenAI Configuration (for n8n workflows)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### File Storage (AWS S3 or similar)
```
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=pilot-invoices
```

### Security
```
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
LOG_LEVEL=info
```

## Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   - Install PostgreSQL locally or use a cloud service
   - Create database: `createdb pilot_invoices`
   - Update database credentials in your .env file

3. **n8n Setup**
   - Install n8n: `npm install -g n8n`
   - Start n8n: `n8n start`
   - Import the workflows from `/docs/n8n-workflows/`

4. **WhatsApp Business API Setup**
   - Create a Facebook Developer account
   - Set up WhatsApp Business API
   - Configure webhook URL to point to your backend

5. **Start the Server**
   ```bash
   npm run dev
   ```

## Directory Structure

```
backend/
├── docs/
│   ├── environment-setup.md
│   ├── n8n-workflows/
│   └── api-documentation.md
├── models/
│   ├── Invoice.js
│   └── WhatsAppGroup.js
├── routes/
│   ├── upload.js
│   ├── webhooks.js
│   ├── whatsapp.js
│   └── invoices.js
├── services/
│   └── n8nService.js
├── uploads/
│   └── invoices/
├── logs/
├── server.js
└── package.json
```
