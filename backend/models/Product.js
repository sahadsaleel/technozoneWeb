const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number, required: true },
  costPrice: { type: Number },
  stock: { type: Number, default: 0 },
  margin: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
