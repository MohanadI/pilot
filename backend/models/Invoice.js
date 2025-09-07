import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // File information
  originalFilename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.ENUM('pdf', 'png', 'jpg', 'jpeg'),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Processing status
  status: {
    type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'failed', 'validated'),
    defaultValue: 'uploaded',
    allowNull: false
  },
  
  // Source information
  source: {
    type: DataTypes.ENUM('upload', 'whatsapp', 'email'),
    allowNull: false
  },
  
  // WhatsApp specific fields
  whatsappGroupId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappMessageId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappSender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Extracted data from AI processing (stored as JSON)
  extractedData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  
  // AI confidence scores (stored as JSON)
  confidenceScores: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  
  // Processing metadata
  n8nWorkflowId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  n8nExecutionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processingStartTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  processingEndTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  processingErrors: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('processingErrors');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('processingErrors', JSON.stringify(value || []));
    }
  },
  
  // Validation flags
  isValidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  validationErrors: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('validationErrors');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('validationErrors', JSON.stringify(value || []));
    }
  }
}, {
  tableName: 'invoices',
  timestamps: true, // This adds createdAt and updatedAt automatically
  indexes: [
    {
      fields: ['status', 'createdAt']
    },
    {
      fields: ['whatsappGroupId']
    },
    {
      fields: ['source']
    },
    {
      // Gin index for JSONB fields for better query performance
      fields: ['extractedData'],
      using: 'gin'
    }
  ]
});

// Add instance methods
Invoice.prototype.getProcessingTime = function() {
  if (this.processingEndTime && this.processingStartTime) {
    return this.processingEndTime - this.processingStartTime;
  }
  return null;
};

// Add class methods
Invoice.getByStatus = function(status) {
  return this.findAll({
    where: { status },
    order: [['createdAt', 'DESC']]
  });
};

Invoice.getBySource = function(source) {
  return this.findAll({
    where: { source },
    order: [['createdAt', 'DESC']]
  });
};

Invoice.getWhatsAppInvoices = function(groupId) {
  return this.findAll({
    where: { 
      source: 'whatsapp',
      whatsappGroupId: groupId
    },
    order: [['createdAt', 'DESC']]
  });
};

export default Invoice;