const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  paymentMethod: { type: String, required: true },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
