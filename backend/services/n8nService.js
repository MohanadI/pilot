import axios from 'axios';
import fs from 'fs/promises';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'n8n-service' }
});

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || `${N8N_BASE_URL}/webhook/invoice-processing`;

/**
 * Trigger n8n workflow for invoice processing
 * @param {Object} data - Invoice data to process
 * @returns {Promise<Object>} - n8n response with workflow and execution IDs
 */
export const triggerN8nWorkflow = async (data) => {
  try {
    const { invoiceId, filePath, filename, fileType, source } = data;

    // Read file and convert to base64
    const fileBuffer = await fs.readFile(filePath);
    const fileBase64 = fileBuffer.toString('base64');

    const payload = {
      invoiceId,
      filename,
      fileType,
      source,
      fileData: fileBase64,
      fileSize: fileBuffer.length,
      timestamp: new Date().toISOString(),
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhooks/n8n-callback`
    };

    logger.info(`Triggering n8n workflow for invoice: ${invoiceId}`, {
      filename,
      fileType,
      source,
      fileSize: fileBuffer.length
    });

    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'Authorization': `Bearer ${N8N_API_KEY}` })
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`n8n workflow triggered successfully for invoice: ${invoiceId}`, {
      status: response.status,
      executionId: response.data?.executionId
    });

    return {
      workflowId: response.data?.workflowId || 'invoice-processing',
      executionId: response.data?.executionId || `exec_${Date.now()}`,
      status: 'triggered',
      response: response.data
    };

  } catch (error) {
    logger.error('Failed to trigger n8n workflow:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      invoiceId: data.invoiceId
    });

    throw new Error(`n8n workflow trigger failed: ${error.message}`);
  }
};

/**
 * Trigger n8n workflow for WhatsApp message processing
 * @param {Object} data - WhatsApp message data
 * @returns {Promise<Object>} - n8n response
 */
export const triggerWhatsAppWorkflow = async (data) => {
  try {
    const {
      groupId,
      messageId,
      sender,
      message,
      attachments,
      timestamp
    } = data;

    const payload = {
      type: 'whatsapp_message',
      groupId,
      messageId,
      sender,
      message,
      attachments: attachments || [],
      timestamp,
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhooks/whatsapp-callback`
    };

    logger.info(`Triggering WhatsApp processing workflow for group: ${groupId}`, {
      messageId,
      sender,
      hasAttachments: attachments && attachments.length > 0
    });

    const response = await axios.post(
      `${N8N_BASE_URL}/webhook/whatsapp-processing`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(N8N_API_KEY && { 'Authorization': `Bearer ${N8N_API_KEY}` })
        },
        timeout: 30000
      }
    );

    logger.info(`WhatsApp workflow triggered successfully for group: ${groupId}`, {
      status: response.status,
      executionId: response.data?.executionId
    });

    return {
      workflowId: response.data?.workflowId || 'whatsapp-processing',
      executionId: response.data?.executionId || `whatsapp_${Date.now()}`,
      status: 'triggered',
      response: response.data
    };

  } catch (error) {
    logger.error('Failed to trigger WhatsApp workflow:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      groupId: data.groupId
    });

    throw new Error(`WhatsApp workflow trigger failed: ${error.message}`);
  }
};

/**
 * Get n8n workflow status
 * @param {string} executionId - n8n execution ID
 * @returns {Promise<Object>} - Workflow status
 */
export const getWorkflowStatus = async (executionId) => {
  try {
    const response = await axios.get(
      `${N8N_BASE_URL}/api/v1/executions/${executionId}`,
      {
        headers: {
          ...(N8N_API_KEY && { 'Authorization': `Bearer ${N8N_API_KEY}` })
        }
      }
    );

    return {
      executionId,
      status: response.data.status,
      startedAt: response.data.startedAt,
      finishedAt: response.data.finishedAt,
      data: response.data
    };

  } catch (error) {
    logger.error(`Failed to get workflow status for execution: ${executionId}`, {
      error: error.message,
      status: error.response?.status
    });

    throw new Error(`Failed to get workflow status: ${error.message}`);
  }
};

/**
 * Cancel n8n workflow execution
 * @param {string} executionId - n8n execution ID
 * @returns {Promise<Object>} - Cancellation result
 */
export const cancelWorkflow = async (executionId) => {
  try {
    const response = await axios.post(
      `${N8N_BASE_URL}/api/v1/executions/${executionId}/stop`,
      {},
      {
        headers: {
          ...(N8N_API_KEY && { 'Authorization': `Bearer ${N8N_API_KEY}` })
        }
      }
    );

    logger.info(`Workflow execution cancelled: ${executionId}`);

    return {
      executionId,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error(`Failed to cancel workflow execution: ${executionId}`, {
      error: error.message,
      status: error.response?.status
    });

    throw new Error(`Failed to cancel workflow: ${error.message}`);
  }
};
