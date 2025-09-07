import express from 'express';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

import Invoice from '../models/Invoice.js';
import WhatsAppGroup from '../models/WhatsAppGroup.js';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'webhook-service' }
});

// Validation middleware for n8n callback
const n8nCallbackValidation = [
  body('invoiceId').notEmpty().withMessage('Invoice ID is required'),
  body('status').isIn(['processed', 'failed']).withMessage('Invalid status'),
  body('executionId').notEmpty().withMessage('Execution ID is required'),
];

/**
 * POST /api/webhooks/n8n-callback
 * Handle callbacks from n8n after invoice processing
 */
router.post('/n8n-callback', n8nCallbackValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      invoiceId,
      status,
      executionId,
      extractedData,
      confidenceScores,
      errors: processingErrors,
      processingTime
    } = req.body;

    logger.info(`Received n8n callback for invoice: ${invoiceId}`, {
      status,
      executionId,
      processingTime
    });

    // Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      logger.error(`Invoice not found for callback: ${invoiceId}`);
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    // Update invoice based on processing result
    invoice.status = status;
    invoice.processingEndTime = new Date();

    if (status === 'processed' && extractedData) {
      // Update with extracted data
      invoice.extractedData = {
        invoiceNumber: extractedData.invoiceNumber,
        vendor: extractedData.vendor,
        vendorAddress: extractedData.vendorAddress,
        date: extractedData.date ? new Date(extractedData.date) : null,
        dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : null,
        amount: extractedData.amount,
        currency: extractedData.currency || 'USD',
        vatAmount: extractedData.vatAmount,
        vatRate: extractedData.vatRate,
        vatId: extractedData.vatId,
        items: extractedData.items || [],
        bankDetails: extractedData.bankDetails || {}
      };

      // Update confidence scores
      if (confidenceScores) {
        invoice.confidenceScores = {
          overall: confidenceScores.overall,
          fields: confidenceScores.fields || {}
        };
      }

      // Auto-validate if confidence is high enough
      const overallConfidence = confidenceScores?.overall || 0;
      if (overallConfidence >= 0.9) {
        invoice.isValidated = true;
        invoice.status = 'validated';
      }

      logger.info(`Invoice processed successfully: ${invoiceId}`, {
        vendor: extractedData.vendor,
        amount: extractedData.amount,
        confidence: overallConfidence
      });

    } else if (status === 'failed') {
      // Update with error information
      invoice.processingErrors = processingErrors || ['Processing failed'];

      logger.error(`Invoice processing failed: ${invoiceId}`, {
        errors: processingErrors
      });
    }

    await invoice.save();

    // Send success response
    res.json({
      message: 'Callback processed successfully',
      invoiceId,
      status: invoice.status
    });

  } catch (error) {
    logger.error('n8n callback error:', error);
    res.status(500).json({
      error: 'Callback processing failed',
      details: error.message
    });
  }
});

/**
 * POST /api/webhooks/whatsapp-callback
 * Handle callbacks from WhatsApp message processing
 */
router.post('/whatsapp-callback', async (req, res) => {
  try {
    const {
      groupId,
      messageId,
      status,
      invoices, // Array of processed invoices
      errors: processingErrors
    } = req.body;

    logger.info(`Received WhatsApp callback for group: ${groupId}`, {
      messageId,
      status,
      invoiceCount: invoices?.length || 0
    });

    // Update group statistics
    const group = await WhatsAppGroup.findOne({ groupId });
    if (group) {
      group.stats.processedMessages += 1;
      group.lastActivityAt = new Date();

      if (status === 'processed' && invoices) {
        group.stats.successfulExtractions += invoices.length;
      } else if (status === 'failed') {
        group.stats.failedExtractions += 1;
      }

      await group.save();
    }

    // If invoices were processed, update their records
    if (invoices && invoices.length > 0) {
      for (const invoiceData of invoices) {
        try {
          const invoice = await Invoice.findById(invoiceData.invoiceId);
          if (invoice) {
            invoice.status = invoiceData.status;
            invoice.extractedData = invoiceData.extractedData;
            invoice.confidenceScores = invoiceData.confidenceScores;
            invoice.processingEndTime = new Date();
            
            if (invoiceData.status === 'failed') {
              invoice.processingErrors = invoiceData.errors || [];
            }
            
            await invoice.save();
          }
        } catch (invoiceError) {
          logger.error(`Failed to update invoice ${invoiceData.invoiceId}:`, invoiceError);
        }
      }
    }

    res.json({
      message: 'WhatsApp callback processed successfully',
      groupId,
      messageId,
      processedInvoices: invoices?.length || 0
    });

  } catch (error) {
    logger.error('WhatsApp callback error:', error);
    res.status(500).json({
      error: 'WhatsApp callback processing failed',
      details: error.message
    });
  }
});

/**
 * POST /api/webhooks/whatsapp-message
 * Handle incoming WhatsApp messages (from WhatsApp Business API webhook)
 */
router.post('/whatsapp-message', async (req, res) => {
  try {
    const {
      entry
    } = req.body;

    if (!entry || !entry[0]?.changes) {
      return res.status(400).json({
        error: 'Invalid WhatsApp webhook payload'
      });
    }

    const changes = entry[0].changes[0];
    const value = changes.value;

    if (!value.messages) {
      // This might be a status update, acknowledge it
      return res.status(200).json({ status: 'acknowledged' });
    }

    for (const message of value.messages) {
      const {
        id: messageId,
        from: sender,
        timestamp,
        text,
        document,
        image
      } = message;

      // Check if this is from a registered group and contains trigger keywords
      const groupId = value.metadata?.display_phone_number; // This might need adjustment based on your WhatsApp setup
      
      const group = await WhatsAppGroup.findOne({ 
        groupId,
        isActive: true 
      });

      if (!group) {
        logger.info(`Message from unregistered group: ${groupId}`);
        continue;
      }

      // Check if message contains trigger keywords
      const messageText = text?.body || '';
      const containsTriggerKeyword = group.triggerKeywords.some(keyword =>
        messageText.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check for attachments
      const hasRelevantAttachment = document || image;

      if (containsTriggerKeyword || hasRelevantAttachment) {
        logger.info(`Processing WhatsApp message from group: ${groupId}`, {
          messageId,
          sender,
          hasAttachment: !!hasRelevantAttachment,
          hasTriggerKeyword: containsTriggerKeyword
        });

        // Update group stats
        group.stats.totalMessages += 1;
        group.stats.lastMessageDate = new Date(parseInt(timestamp) * 1000);
        await group.save();

        // Process attachments if any
        if (hasRelevantAttachment) {
          const attachment = document || image;
          
          // Create invoice record for WhatsApp attachment
          const invoice = new Invoice({
            originalFilename: attachment.filename || `whatsapp_${messageId}`,
            fileType: attachment.mime_type?.split('/')[1] || 'unknown',
            fileSize: 0, // WhatsApp doesn't provide size directly
            source: 'whatsapp',
            whatsappGroupId: groupId,
            whatsappMessageId: messageId,
            whatsappSender: sender,
            status: 'uploaded',
            processingStartTime: new Date()
          });

          await invoice.save();

          // Here you would typically download the file from WhatsApp
          // and then trigger the n8n workflow
          // This is a placeholder - you'll need to implement WhatsApp media download
          
          logger.info(`Created invoice record for WhatsApp attachment: ${invoice._id}`);
        }
      }
    }

    res.status(200).json({ status: 'processed' });

  } catch (error) {
    logger.error('WhatsApp message processing error:', error);
    res.status(500).json({
      error: 'Failed to process WhatsApp message',
      details: error.message
    });
  }
});

/**
 * GET /api/webhooks/whatsapp-verify
 * WhatsApp webhook verification endpoint
 */
router.get('/whatsapp-verify', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'pilot_whatsapp_verify';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('WhatsApp webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      logger.error('WhatsApp webhook verification failed', { mode, token });
      res.sendStatus(403);
    }
  } else {
    res.status(400).json({ error: 'Missing verification parameters' });
  }
});

export default router;
