import express from 'express';
import { body, query, validationResult } from 'express-validator';
import winston from 'winston';

import WhatsAppGroup from '../models/WhatsAppGroup.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'whatsapp-service' }
});

// Validation middleware
const groupValidation = [
  body('groupId').notEmpty().withMessage('Group ID is required'),
  body('groupName').notEmpty().withMessage('Group name is required'),
  body('triggerKeywords').optional().isArray().withMessage('Trigger keywords must be an array'),
  body('maxFileSize').optional().isNumeric().withMessage('Max file size must be a number'),
];

/**
 * POST /api/whatsapp/groups
 * Connect a new WhatsApp group
 */
router.post('/groups', groupValidation, async (req, res) => {
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
      groupId,
      groupName,
      groupDescription,
      triggerKeywords,
      autoProcessAttachments = true,
      allowedFileTypes = ['pdf', 'png', 'jpg', 'jpeg'],
      maxFileSize = 10 * 1024 * 1024, // 10MB
      connectedBy
    } = req.body;

    // Check if group already exists
    const existingGroup = await WhatsAppGroup.findOne({ groupId });
    if (existingGroup) {
      return res.status(409).json({
        error: 'Group already connected',
        group: {
          id: existingGroup._id,
          groupId: existingGroup.groupId,
          groupName: existingGroup.groupName,
          isActive: existingGroup.isActive
        }
      });
    }

    // Create new group
    const group = new WhatsAppGroup({
      groupId,
      groupName,
      groupDescription,
      triggerKeywords: triggerKeywords || ['Invoice', 'invoice', 'INVOICE', 'bill', 'Bill', 'BILL'],
      autoProcessAttachments,
      allowedFileTypes,
      maxFileSize,
      connectedBy,
      isActive: true
    });

    await group.save();

    logger.info(`WhatsApp group connected: ${groupId}`, {
      groupName,
      connectedBy
    });

    res.status(201).json({
      message: 'WhatsApp group connected successfully',
      group: {
        id: group._id,
        groupId: group.groupId,
        groupName: group.groupName,
        triggerKeywords: group.triggerKeywords,
        isActive: group.isActive,
        connectedAt: group.createdAt
      }
    });

  } catch (error) {
    logger.error('Failed to connect WhatsApp group:', error);
    res.status(500).json({
      error: 'Failed to connect group',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/groups
 * Get all connected WhatsApp groups
 */
router.get('/groups', async (req, res) => {
  try {
    const {
      active = 'true',
      limit = '10',
      offset = '0'
    } = req.query;

    const filter = {};
    if (active === 'true') {
      filter.isActive = true;
    }

    const groups = await WhatsAppGroup.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await WhatsAppGroup.countDocuments(filter);

    res.json({
      groups: groups.map(group => ({
        id: group._id,
        groupId: group.groupId,
        groupName: group.groupName,
        groupDescription: group.groupDescription,
        isActive: group.isActive,
        triggerKeywords: group.triggerKeywords,
        stats: group.stats,
        connectedAt: group.createdAt,
        lastActivityAt: group.lastActivityAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + groups.length < total
      }
    });

  } catch (error) {
    logger.error('Failed to get WhatsApp groups:', error);
    res.status(500).json({
      error: 'Failed to retrieve groups',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/groups/:groupId
 * Get specific WhatsApp group details
 */
router.get('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await WhatsAppGroup.findOne({ groupId });
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Get recent invoices from this group
    const recentInvoices = await Invoice.find({
      whatsappGroupId: groupId
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('originalFilename status extractedData.vendor extractedData.amount createdAt');

    res.json({
      group: {
        id: group._id,
        groupId: group.groupId,
        groupName: group.groupName,
        groupDescription: group.groupDescription,
        isActive: group.isActive,
        triggerKeywords: group.triggerKeywords,
        autoProcessAttachments: group.autoProcessAttachments,
        allowedFileTypes: group.allowedFileTypes,
        maxFileSize: group.maxFileSize,
        stats: group.stats,
        connectedAt: group.createdAt,
        lastActivityAt: group.lastActivityAt
      },
      recentInvoices
    });

  } catch (error) {
    logger.error('Failed to get WhatsApp group:', error);
    res.status(500).json({
      error: 'Failed to retrieve group',
      details: error.message
    });
  }
});

/**
 * PUT /api/whatsapp/groups/:groupId
 * Update WhatsApp group settings
 */
router.put('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      groupName,
      groupDescription,
      triggerKeywords,
      autoProcessAttachments,
      allowedFileTypes,
      maxFileSize,
      isActive
    } = req.body;

    const group = await WhatsAppGroup.findOne({ groupId });
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Update fields
    if (groupName !== undefined) group.groupName = groupName;
    if (groupDescription !== undefined) group.groupDescription = groupDescription;
    if (triggerKeywords !== undefined) group.triggerKeywords = triggerKeywords;
    if (autoProcessAttachments !== undefined) group.autoProcessAttachments = autoProcessAttachments;
    if (allowedFileTypes !== undefined) group.allowedFileTypes = allowedFileTypes;
    if (maxFileSize !== undefined) group.maxFileSize = maxFileSize;
    if (isActive !== undefined) group.isActive = isActive;

    await group.save();

    logger.info(`WhatsApp group updated: ${groupId}`, {
      groupName: group.groupName,
      isActive: group.isActive
    });

    res.json({
      message: 'Group updated successfully',
      group: {
        id: group._id,
        groupId: group.groupId,
        groupName: group.groupName,
        isActive: group.isActive,
        updatedAt: group.updatedAt
      }
    });

  } catch (error) {
    logger.error('Failed to update WhatsApp group:', error);
    res.status(500).json({
      error: 'Failed to update group',
      details: error.message
    });
  }
});

/**
 * DELETE /api/whatsapp/groups/:groupId
 * Disconnect WhatsApp group
 */
router.delete('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await WhatsAppGroup.findOne({ groupId });
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Soft delete - just deactivate the group
    group.isActive = false;
    await group.save();

    logger.info(`WhatsApp group disconnected: ${groupId}`);

    res.json({
      message: 'Group disconnected successfully',
      groupId
    });

  } catch (error) {
    logger.error('Failed to disconnect WhatsApp group:', error);
    res.status(500).json({
      error: 'Failed to disconnect group',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/groups/:groupId/stats
 * Get detailed statistics for a WhatsApp group
 */
router.get('/groups/:groupId/stats', async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      period = '30d' // 7d, 30d, 90d
    } = req.query;

    const group = await WhatsAppGroup.findOne({ groupId });
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(now - periodDays * 24 * 60 * 60 * 1000);

    // Get invoice statistics
    const invoiceStats = await Invoice.aggregate([
      {
        $match: {
          whatsappGroupId: groupId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: {
            $sum: { $ifNull: ['$extractedData.amount', 0] }
          }
        }
      }
    ]);

    // Get daily activity
    const dailyActivity = await Invoice.aggregate([
      {
        $match: {
          whatsappGroupId: groupId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      groupId,
      period,
      stats: {
        overall: group.stats,
        period: {
          invoicesByStatus: invoiceStats,
          dailyActivity,
          dateRange: {
            start: startDate,
            end: now
          }
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get WhatsApp group stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve stats',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/groups/:groupId/test
 * Test WhatsApp group connection and trigger keywords
 */
router.post('/groups/:groupId/test', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;

    const group = await WhatsAppGroup.findOne({ groupId });
    if (!group) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    if (!group.isActive) {
      return res.status(400).json({
        error: 'Group is not active'
      });
    }

    // Test if message contains trigger keywords
    const containsTriggerKeyword = group.triggerKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    const matchedKeywords = group.triggerKeywords.filter(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    res.json({
      groupId,
      groupName: group.groupName,
      testMessage: message,
      wouldTrigger: containsTriggerKeyword,
      matchedKeywords,
      allTriggerKeywords: group.triggerKeywords
    });

  } catch (error) {
    logger.error('Failed to test WhatsApp group:', error);
    res.status(500).json({
      error: 'Failed to test group',
      details: error.message
    });
  }
});

export default router;
