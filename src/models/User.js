const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');

class User extends Model {}
User.init({
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'customer'), defaultValue: 'customer' }
}, { sequelize, modelName: 'user' });

module.exports = User;
