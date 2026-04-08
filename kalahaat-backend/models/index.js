const User = require('./User.js');
const Product = require('./Product.js');
const Address = require('./Address.js');
const { Cart, CartItem } = require('./Cart.js');
const { Order, OrderItem } = require('./Order.js');
const { Review, Transaction } = require('./Review.js');

// User & Address (One-to-Many)
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User & Product (Artisan relationship)
User.hasMany(Product, { foreignKey: 'artisanUserId', as: 'ownedProducts' });
Product.belongsTo(User, { foreignKey: 'artisanUserId', as: 'artisanUser' });

// Product verification (Consultant/Admin relationship)
Product.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// User & Cart (One-to-One)
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart & Product through CartItems (Many-to-Many)
Cart.belongsToMany(Product, { through: CartItem, foreignKey: 'cartId', as: 'products' });
Product.belongsToMany(Cart, { through: CartItem, foreignKey: 'productId', as: 'carts' });

// User & Order (One-to-Many)
User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// OrderItems relationship
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' }); // Link back to product if still exists

// User & Review (One-to-Many)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product & Review (One-to-Many)
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User & Wishlist (Many-to-Many through WishlistItems)
const WishlistItem = require('../config/database').sequelize.define('WishlistItem', {});
User.belongsToMany(Product, { through: WishlistItem, foreignKey: 'userId', as: 'wishlistItems' });
Product.belongsToMany(User, { through: WishlistItem, foreignKey: 'productId', as: 'wishlistedBy' });

// User & Transaction (One-to-Many)
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order & Transaction (One-to-One)
Order.hasOne(Transaction, { foreignKey: 'orderId', as: 'transaction' });
Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

const { sequelize } = require('../config/database');

module.exports = {
  sequelize,
  User,
  Product,
  Address,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Transaction,
  WishlistItem
};
