const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supplierName: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true }
  }],
  totalCost: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Received' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
