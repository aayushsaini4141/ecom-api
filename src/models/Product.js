const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');
const Category = require('./Category');

class Product extends Model {}
Product.init({
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  imageUrl: { type: DataTypes.STRING },
}, { sequelize, modelName: 'product' });

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

module.exports = Product;
