const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');

class Category extends Model {}
Category.init({
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING }
}, { sequelize, modelName: 'category' });

module.exports = Category;
