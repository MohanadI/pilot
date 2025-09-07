import express from 'express';
import { query, body, validationResult } from 'express-validator';
import winston from 'winston';

import Invoice from '../models/Invoice.js';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'invoice-service' }
});

/**
 * GET /api/invoices
 * Get all invoices with filtering and pagination
 */
router.get('/', [
  query('status').optional().isIn(['uploaded', 'processing', 'processed', 'failed', 'validated']),
  query('source').optional().isIn(['upload', 'whatsapp', 'email']),
  query('limit').optional().isNumeric().withMessage('Limit must be a number'),
  query('offset').optional().isNumeric().withMessage('Offset must be a number'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'amount', 'vendor']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      status,
      source,
      vendor,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      limit = '20',
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (vendor) filter['extractedData.vendor'] = new RegExp(vendor, 'i');
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (minAmount || maxAmount) {
      filter['extractedData.amount'] = {};
      if (minAmount) filter['extractedData.amount'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['extractedData.amount'].$lte = parseFloat(maxAmount);
    }

    // Build sort
    const sort = {};
    if (sortBy === 'amount') {
      sort['extractedData.amount'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'vendor') {
      sort['extractedData.vendor'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const invoices = await Invoice.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-fileUrl'); // Don't include file paths for security

    const total = await Invoice.countDocuments(filter);

    res.json({
      invoices: invoices.map(invoice => ({
        id: invoice._id,
        filename: invoice.originalFilename,
        status: invoice.status,
        source: invoice.source,
        extractedData: invoice.extractedData,
        confidenceScores: invoice.confidenceScores,
        isValidated: invoice.isValidated,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        processingTime: invoice.processingEndTime && invoice.processingStartTime
          ? invoice.processingEndTime - invoice.processingStartTime
          : null,
        ...(invoice.source === 'whatsapp' && {
          whatsappInfo: {
            groupId: invoice.whatsappGroupId,
            messageId: invoice.whatsappMessageId,
            sender: invoice.whatsappSender
          }
        })
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + invoices.length < total
      }
    });

  } catch (error) {
    logger.error('Failed to get invoices:', error);
    res.status(500).json({
      error: 'Failed to retrieve invoices',
      details: error.message
    });
  }
});

/**
 * GET /api/invoices/:id
 * Get specific invoice details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    res.json({
      id: invoice._id,
      filename: invoice.originalFilename,
      fileType: invoice.fileType,
      fileSize: invoice.fileSize,
      status: invoice.status,
      source: invoice.source,
      extractedData: invoice.extractedData,
      confidenceScores: invoice.confidenceScores,
      isValidated: invoice.isValidated,
      validationErrors: invoice.validationErrors,
      processingErrors: invoice.processingErrors,
      n8nWorkflowId: invoice.n8nWorkflowId,
      n8nExecutionId: invoice.n8nExecutionId,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      processingStartTime: invoice.processingStartTime,
      processingEndTime: invoice.processingEndTime,
      processingTime: invoice.processingEndTime && invoice.processingStartTime
        ? invoice.processingEndTime - invoice.processingStartTime
        : null,
      ...(invoice.source === 'whatsapp' && {
        whatsappInfo: {
          groupId: invoice.whatsappGroupId,
          messageId: invoice.whatsappMessageId,
          sender: invoice.whatsappSender
        }
      })
    });

  } catch (error) {
    logger.error('Failed to get invoice:', error);
    res.status(500).json({
      error: 'Failed to retrieve invoice',
      details: error.message
    });
  }
});

/**
 * PUT /api/invoices/:id/validate
 * Manually validate/invalidate an invoice
 */
router.put('/:id/validate', [
  body('isValidated').isBoolean().withMessage('isValidated must be a boolean'),
  body('validationErrors').optional().isArray().withMessage('validationErrors must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isValidated, validationErrors } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    invoice.isValidated = isValidated;
    invoice.validationErrors = validationErrors || [];
    
    // Update status based on validation
    if (isValidated && invoice.status === 'processed') {
      invoice.status = 'validated';
    } else if (!isValidated && invoice.status === 'validated') {
      invoice.status = 'processed';
    }

    await invoice.save();

    logger.info(`Invoice validation updated: ${id}`, {
      isValidated,
      status: invoice.status
    });

    res.json({
      message: 'Invoice validation updated',
      invoice: {
        id: invoice._id,
        isValidated: invoice.isValidated,
        status: invoice.status,
        validationErrors: invoice.validationErrors
      }
    });

  } catch (error) {
    logger.error('Failed to update invoice validation:', error);
    res.status(500).json({
      error: 'Failed to update validation',
      details: error.message
    });
  }
});

/**
 * PUT /api/invoices/:id/data
 * Update extracted data for an invoice
 */
router.put('/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    const { extractedData } = req.body;

    if (!extractedData || typeof extractedData !== 'object') {
      return res.status(400).json({
        error: 'extractedData is required and must be an object'
      });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    // Update extracted data
    invoice.extractedData = {
      ...invoice.extractedData,
      ...extractedData
    };

    // Parse dates if provided as strings
    if (extractedData.date) {
      invoice.extractedData.date = new Date(extractedData.date);
    }
    if (extractedData.dueDate) {
      invoice.extractedData.dueDate = new Date(extractedData.dueDate);
    }

    // Reset validation status since data was manually modified
    invoice.isValidated = false;
    invoice.validationErrors = [];

    await invoice.save();

    logger.info(`Invoice data updated: ${id}`, {
      vendor: extractedData.vendor,
      amount: extractedData.amount
    });

    res.json({
      message: 'Invoice data updated successfully',
      invoice: {
        id: invoice._id,
        extractedData: invoice.extractedData,
        isValidated: invoice.isValidated
      }
    });

  } catch (error) {
    logger.error('Failed to update invoice data:', error);
    res.status(500).json({
      error: 'Failed to update data',
      details: error.message
    });
  }
});

/**
 * DELETE /api/invoices/:id
 * Delete an invoice
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    await Invoice.findByIdAndDelete(id);

    // TODO: Also delete the actual file from storage
    // This would depend on your storage solution (local, S3, etc.)

    logger.info(`Invoice deleted: ${id}`, {
      filename: invoice.originalFilename
    });

    res.json({
      message: 'Invoice deleted successfully',
      id
    });

  } catch (error) {
    logger.error('Failed to delete invoice:', error);
    res.status(500).json({
      error: 'Failed to delete invoice',
      details: error.message
    });
  }
});

/**
 * GET /api/invoices/stats/overview
 * Get invoice statistics overview
 */
router.get('/stats/overview', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
], async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const startDate = new Date(now - periodDays * 24 * 60 * 60 * 1000);

    // Get overall statistics
    const stats = await Invoice.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          bySource: [
            { $group: { _id: "$source", count: { $sum: 1 } } }
          ],
          periodStats: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: { $ifNull: ["$extractedData.amount", 0] } },
                avgAmount: { $avg: { $ifNull: ["$extractedData.amount", 0] } },
                avgConfidence: { $avg: { $ifNull: ["$confidenceScores.overall", 0] } }
              }
            }
          ],
          dailyActivity: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 },
                totalAmount: { $sum: { $ifNull: ["$extractedData.amount", 0] } }
              }
            },
            { $sort: { "_id": 1 } }
          ]
        }
      }
    ]);

    res.json({
      period,
      dateRange: { start: startDate, end: now },
      stats: {
        total: stats[0].total[0]?.count || 0,
        byStatus: stats[0].byStatus,
        bySource: stats[0].bySource,
        period: stats[0].periodStats[0] || {
          count: 0,
          totalAmount: 0,
          avgAmount: 0,
          avgConfidence: 0
        },
        dailyActivity: stats[0].dailyActivity
      }
    });

  } catch (error) {
    logger.error('Failed to get invoice stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      details: error.message
    });
  }
});

export default router;
