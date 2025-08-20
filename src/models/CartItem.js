const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');
const Cart = require('./Cart');
const Product = require('./Product');

class CartItem extends Model {}
CartItem.init({
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  priceAtAdd: { type: DataTypes.FLOAT, allowNull: false }, // persistent pricing
}, { sequelize, modelName: 'cartitem' });

CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

module.exports = CartItem;
