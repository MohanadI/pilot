import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import winston from 'winston';

import { Invoice } from '../models/index.js';
import { triggerN8nWorkflow } from '../services/n8nService.js';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'upload-service' }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads/invoices';
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Validation middleware
const uploadValidation = [
  body('source').optional().isIn(['upload', 'whatsapp', 'email']).withMessage('Invalid source'),
];

/**
 * POST /api/upload
 * Upload invoice file and trigger processing
 */
router.post('/', upload.single('invoice'), uploadValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const { source = 'upload' } = req.body;

    // Create invoice record in database
    const invoice = await Invoice.create({
      originalFilename: req.file.originalname,
      fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
      fileSize: req.file.size,
      fileUrl: req.file.path,
      source,
      status: 'uploaded',
      processingStartTime: new Date()
    });

    logger.info(`Invoice uploaded: ${invoice.id}`, {
      filename: req.file.originalname,
      size: req.file.size,
      source
    });

    // Trigger n8n workflow
    try {
      const n8nResponse = await triggerN8nWorkflow({
        invoiceId: invoice.id,
        filePath: req.file.path,
        filename: req.file.originalname,
        fileType: invoice.fileType,
        source
      });

      // Update invoice with n8n workflow information
      await invoice.update({
        n8nWorkflowId: n8nResponse.workflowId,
        n8nExecutionId: n8nResponse.executionId,
        status: 'processing'
      });

      logger.info(`n8n workflow triggered for invoice: ${invoice.id}`, {
        workflowId: n8nResponse.workflowId,
        executionId: n8nResponse.executionId
      });

    } catch (n8nError) {
      logger.error(`Failed to trigger n8n workflow for invoice: ${invoice.id}`, n8nError);
      
      await invoice.update({
        status: 'failed',
        processingErrors: [n8nError.message]
      });
      
      return res.status(500).json({
        error: 'Failed to start processing',
        invoiceId: invoice.id,
        details: n8nError.message
      });
    }

    // Return success response
    res.status(201).json({
      message: 'Invoice uploaded successfully and processing started',
      invoice: {
        id: invoice.id,
        filename: invoice.originalFilename,
        status: invoice.status,
        uploadedAt: invoice.createdAt
      }
    });

  } catch (error) {
    logger.error('Upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to clean up uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
});

/**
 * GET /api/upload/status/:invoiceId
 * Get upload and processing status
 */
router.get('/status/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    res.json({
      id: invoice.id,
      filename: invoice.originalFilename,
      status: invoice.status,
      uploadedAt: invoice.createdAt,
      processingStartTime: invoice.processingStartTime,
      processingEndTime: invoice.processingEndTime,
      extractedData: invoice.extractedData,
      confidenceScores: invoice.confidenceScores,
      errors: invoice.processingErrors
    });

  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check status',
      details: error.message
    });
  }
});

/**
 * POST /api/upload/retry/:invoiceId
 * Retry processing for failed invoice
 */
router.post('/retry/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    if (invoice.status !== 'failed') {
      return res.status(400).json({
        error: 'Can only retry failed invoices'
      });
    }

    // Reset processing status
    await invoice.update({
      status: 'processing',
      processingStartTime: new Date(),
      processingErrors: []
    });

    // Trigger n8n workflow again
    const n8nResponse = await triggerN8nWorkflow({
      invoiceId: invoice.id,
      filePath: invoice.fileUrl,
      filename: invoice.originalFilename,
      fileType: invoice.fileType,
      source: invoice.source
    });

    await invoice.update({
      n8nWorkflowId: n8nResponse.workflowId,
      n8nExecutionId: n8nResponse.executionId
    });

    res.json({
      message: 'Processing restarted',
      invoice: {
        id: invoice.id,
        status: invoice.status
      }
    });

  } catch (error) {
    logger.error('Retry error:', error);
    res.status(500).json({
      error: 'Failed to retry processing',
      details: error.message
    });
  }
});

export default router;
