const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./User');

class Cart extends Model {}
Cart.init({}, { sequelize, modelName: 'cart' });

Cart.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Cart, { foreignKey: 'userId' });

module.exports = Cart;
