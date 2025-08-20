const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./User');

class Order extends Model {}
Order.init({
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
}, { sequelize, modelName: 'order' });

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

module.exports = Order;
