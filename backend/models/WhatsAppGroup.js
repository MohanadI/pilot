import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WhatsAppGroup = sequelize.define('WhatsAppGroup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Group identification
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  groupDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Connection details
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Configuration
  triggerKeywords: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('triggerKeywords');
      return value ? JSON.parse(value) : ['Invoice', 'invoice', 'INVOICE', 'bill', 'Bill', 'BILL'];
    },
    set(value) {
      this.setDataValue('triggerKeywords', JSON.stringify(value || ['Invoice', 'invoice', 'INVOICE', 'bill', 'Bill', 'BILL']));
    }
  },
  
  // Processing settings
  autoProcessAttachments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowedFileTypes: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('allowedFileTypes');
      return value ? JSON.parse(value) : ['pdf', 'png', 'jpg', 'jpeg'];
    },
    set(value) {
      this.setDataValue('allowedFileTypes', JSON.stringify(value || ['pdf', 'png', 'jpg', 'jpeg']));
    }
  },
  maxFileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 10 * 1024 * 1024 // 10MB in bytes
  },
  
  // Webhook configuration
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  webhookSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Statistics (stored as JSON)
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalMessages: 0,
      processedMessages: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      lastMessageDate: null
    }
  },
  
  // User/Admin info
  connectedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Last activity tracking
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'whatsapp_groups',
  timestamps: true, // This adds createdAt and updatedAt automatically
  indexes: [
    {
      fields: ['groupId'],
      unique: true
    },
    {
      fields: ['isActive', 'createdAt']
    },
    {
      fields: ['connectedBy']
    }
  ]
});

// Instance methods
WhatsAppGroup.prototype.incrementMessageCount = function() {
  const currentStats = this.stats || {};
  currentStats.totalMessages = (currentStats.totalMessages || 0) + 1;
  currentStats.lastMessageDate = new Date();
  return this.update({ 
    stats: currentStats,
    lastActivityAt: new Date()
  });
};

WhatsAppGroup.prototype.incrementProcessedCount = function() {
  const currentStats = this.stats || {};
  currentStats.processedMessages = (currentStats.processedMessages || 0) + 1;
  return this.update({ stats: currentStats });
};

WhatsAppGroup.prototype.incrementSuccessCount = function() {
  const currentStats = this.stats || {};
  currentStats.successfulExtractions = (currentStats.successfulExtractions || 0) + 1;
  return this.update({ stats: currentStats });
};

WhatsAppGroup.prototype.incrementFailedCount = function() {
  const currentStats = this.stats || {};
  currentStats.failedExtractions = (currentStats.failedExtractions || 0) + 1;
  return this.update({ stats: currentStats });
};

WhatsAppGroup.prototype.hasKeyword = function(message) {
  const keywords = this.triggerKeywords || [];
  return keywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Class methods
WhatsAppGroup.getActiveGroups = function() {
  return this.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']]
  });
};

WhatsAppGroup.findByGroupId = function(groupId) {
  return this.findOne({
    where: { groupId }
  });
};

WhatsAppGroup.getGroupStats = function(groupId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findOne({
    where: { groupId },
    include: [{
      model: sequelize.models.Invoice,
      where: {
        whatsappGroupId: groupId,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: startDate
        }
      },
      required: false
    }]
  });
};

export default WhatsAppGroup;