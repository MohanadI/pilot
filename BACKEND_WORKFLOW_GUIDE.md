# Backend Implementation Workflow Guide

## Overview

This guide provides a comprehensive step-by-step workflow to build and deploy the backend system with n8n middleware integration for invoice processing via file upload and WhatsApp group monitoring.

## Architecture Overview

```
User (UI) 
    ↓
Upload Invoice (PDF/Image) / WhatsApp Message
    ↓
Backend API (Node.js/Express)
    ↓
n8n Webhook Trigger
    ↓
┌──────────────────────────────────────────┐
│            n8n Workflow                  │
│                                          │
│  1. File Ingestion                       │
│     - Receive file (base64 or URL)       │
│     - Store raw copy                     │
│                                          │
│  2. OCR & Parsing                        │
│     - PDF: extract text                  │
│     - Image: OCR processing              │
│                                          │
│  3. AI Extraction (GPT-4)                │
│     - Extract structured fields          │
│     - {date, vendor, amount, vat}        │
│                                          │
│  4. Validation & Enrichment              │
│     - Regex checks (IBAN, VAT ID)       │
│     - Confidence score validation       │
│                                          │
│  5. Storage & Callback                   │
│     - Save to MongoDB                   │
│     - Send status → Backend API         │
└──────────────────────────────────────────┘
    ↓
Update Invoice Status in Database
    ↓
UI Refresh (Processing → Stored/Validated)
```

## Step-by-Step Implementation

### Phase 1: Backend Server Setup ✅

#### Step 1.1: Initialize Backend Project
```bash
cd backend
npm install
```

#### Step 1.2: Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create `.env` file with database connection string
3. Start MongoDB service

#### Step 1.3: Environment Configuration
Create `.env` file with required variables:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pilot-invoices
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=http://localhost:5678/webhook/invoice-processing
OPENAI_API_KEY=your_openai_api_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
```

#### Step 1.4: Start Backend Server
```bash
npm run dev
```

Server will be running on `http://localhost:3001`

### Phase 2: n8n Setup and Configuration

#### Step 2.1: Install and Start n8n
```bash
npm install -g n8n
n8n start
```

Access n8n at `http://localhost:5678`

#### Step 2.2: Import Workflows
1. Open n8n interface
2. Go to Workflows → Import
3. Import the following workflows from `backend/docs/n8n-workflows/`:
   - `invoice-processing-workflow.json`
   - `whatsapp-processing-workflow.json`

#### Step 2.3: Configure Credentials
In n8n, set up the following credentials:
1. **OpenAI API**: Add your OpenAI API key
2. **HTTP Basic Auth**: For secure webhook calls (optional)

#### Step 2.4: Activate Workflows
1. Open each imported workflow
2. Click "Active" to enable the workflow
3. Note the webhook URLs for each workflow

### Phase 3: File Upload Implementation ✅

#### Step 3.1: API Endpoints Available
- `POST /api/upload` - Upload invoice file
- `GET /api/upload/status/:invoiceId` - Check processing status
- `POST /api/upload/retry/:invoiceId` - Retry failed processing

#### Step 3.2: Test File Upload
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "invoice=@sample-invoice.pdf" \
  -F "source=upload"
```

#### Step 3.3: Processing Flow
1. File is uploaded and validated
2. Invoice record created in MongoDB
3. n8n workflow triggered via webhook
4. File processed (OCR/text extraction)
5. AI extraction using GPT-4
6. Results validated and stored
7. Callback sent to backend
8. Invoice status updated

### Phase 4: WhatsApp Integration

#### Step 4.1: WhatsApp Business API Setup
1. Create Facebook Developer account
2. Set up WhatsApp Business API
3. Get access tokens and phone number ID
4. Configure webhook URL: `https://your-domain.com/api/webhooks/whatsapp-message`

#### Step 4.2: WhatsApp Group Management
Available endpoints:
- `POST /api/whatsapp/groups` - Connect WhatsApp group
- `GET /api/whatsapp/groups` - List connected groups
- `PUT /api/whatsapp/groups/:groupId` - Update group settings
- `GET /api/whatsapp/groups/:groupId/stats` - Get group statistics

#### Step 4.3: Connect WhatsApp Group
```bash
curl -X POST http://localhost:3001/api/whatsapp/groups \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "your-group-id",
    "groupName": "Invoice Processing Group",
    "triggerKeywords": ["Invoice", "bill", "receipt"],
    "connectedBy": "admin"
  }'
```

#### Step 4.4: WhatsApp Processing Flow
1. Message received in connected WhatsApp group
2. Check for trigger keywords or attachments
3. Download and process attachments
4. Trigger n8n WhatsApp processing workflow
5. Extract invoice data using AI
6. Create invoice records
7. Send callback to backend
8. Update group statistics

### Phase 5: API Endpoints Overview

#### Upload Endpoints
- `POST /api/upload` - Upload invoice file
- `GET /api/upload/status/:id` - Get upload status
- `POST /api/upload/retry/:id` - Retry processing

#### WhatsApp Endpoints
- `POST /api/whatsapp/groups` - Connect group
- `GET /api/whatsapp/groups` - List groups
- `GET /api/whatsapp/groups/:id` - Get group details
- `PUT /api/whatsapp/groups/:id` - Update group
- `DELETE /api/whatsapp/groups/:id` - Disconnect group
- `GET /api/whatsapp/groups/:id/stats` - Group statistics

#### Invoice Endpoints
- `GET /api/invoices` - List invoices with filters
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id/validate` - Validate invoice
- `PUT /api/invoices/:id/data` - Update extracted data
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/stats/overview` - Invoice statistics

#### Webhook Endpoints
- `POST /api/webhooks/n8n-callback` - n8n processing callback
- `POST /api/webhooks/whatsapp-callback` - WhatsApp callback
- `POST /api/webhooks/whatsapp-message` - WhatsApp message receiver
- `GET /api/webhooks/whatsapp-verify` - WhatsApp verification

### Phase 6: Frontend Integration

#### Step 6.1: Update Frontend Components
Update existing components to connect with backend:
- `FileUploader.tsx` - Connect to upload API
- `InvoiceList.tsx` - Fetch invoices from backend
- `ProcessingStatus.tsx` - Real-time status updates
- `StatsGrid.tsx` - Display statistics

#### Step 6.2: Add WhatsApp Management
Create new components:
- WhatsApp group connection interface
- Group management dashboard
- WhatsApp statistics display

### Phase 7: Testing and Validation

#### Step 7.1: Test File Upload Flow
1. Upload PDF invoice via frontend
2. Check processing status
3. Verify extracted data accuracy
4. Validate confidence scores

#### Step 7.2: Test WhatsApp Integration
1. Connect WhatsApp group
2. Send message with "Invoice" keyword and attachment
3. Verify automatic processing
4. Check group statistics

#### Step 7.3: Error Handling Tests
1. Upload invalid file formats
2. Test network failures
3. Verify retry mechanisms
4. Check error logging

### Phase 8: Deployment Considerations

#### Step 8.1: Production Environment Setup
1. Set up production MongoDB cluster
2. Deploy n8n instance with proper security
3. Configure SSL certificates
4. Set up reverse proxy (nginx)

#### Step 8.2: Monitoring and Logging
1. Implement health checks
2. Set up log aggregation
3. Monitor n8n workflow performance
4. Set up alerting for failures

#### Step 8.3: Security
1. Implement API authentication/authorization
2. Secure webhook endpoints
3. Validate file uploads
4. Rate limiting
5. Input sanitization

## Key Features Implemented

### ✅ File Upload Processing
- Multi-format support (PDF, PNG, JPG, JPEG)
- File validation and size limits
- Asynchronous processing with status tracking
- Retry mechanism for failed processing
- Confidence scoring and validation

### ✅ WhatsApp Group Integration
- Group connection and management
- Keyword-based message filtering
- Automatic attachment processing
- Real-time statistics tracking
- Group activity monitoring

### ✅ AI-Powered Data Extraction
- GPT-4 integration for intelligent extraction
- Structured data output (vendor, amount, dates, etc.)
- Confidence scoring for reliability
- Format validation (IBAN, VAT IDs)
- Error handling and fallback processing

### ✅ Comprehensive API
- RESTful API design
- Input validation and sanitization
- Error handling with proper HTTP codes
- Pagination and filtering support
- Real-time status updates

## Next Steps

1. **Frontend Integration**: Connect existing React components to the new backend APIs
2. **User Authentication**: Implement user management and permissions
3. **Data Export**: Add export functionality for processed invoices
4. **Advanced Analytics**: Implement detailed reporting and analytics
5. **Performance Optimization**: Add caching and optimize database queries
6. **Multi-tenant Support**: Support for multiple organizations/users

## Troubleshooting

### Common Issues
1. **n8n Webhook Not Triggering**: Check webhook URL and n8n service status
2. **MongoDB Connection Failed**: Verify connection string and database service
3. **File Upload Errors**: Check file size limits and storage permissions
4. **WhatsApp Webhook Issues**: Verify webhook URL and verify token
5. **AI Extraction Failures**: Check OpenAI API key and rate limits

### Debugging Tips
1. Check server logs in `backend/logs/`
2. Monitor n8n execution logs
3. Use API testing tools (Postman, curl)
4. Enable debug logging in development
5. Check database connections and data integrity
