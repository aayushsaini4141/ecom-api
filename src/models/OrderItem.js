const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');
const Order = require('./Order');
const Product = require('./Product');

class OrderItem extends Model {}
OrderItem.init({
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  priceAtOrder: { type: DataTypes.FLOAT, allowNull: false }, // persistent pricing
}, { sequelize, modelName: 'orderitem' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

module.exports = OrderItem;
