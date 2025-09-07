import sequelize from '../config/database.js';
import Invoice from './Invoice.js';
import WhatsAppGroup from './WhatsAppGroup.js';

// Define associations
Invoice.belongsTo(WhatsAppGroup, {
  foreignKey: 'whatsappGroupId',
  targetKey: 'groupId',
  as: 'whatsappGroup'
});

WhatsAppGroup.hasMany(Invoice, {
  foreignKey: 'whatsappGroupId',
  sourceKey: 'groupId',
  as: 'invoices'
});

// Export models and sequelize instance
export {
  sequelize,
  Invoice,
  WhatsAppGroup
};

export default {
  sequelize,
  Invoice,
  WhatsAppGroup
};
