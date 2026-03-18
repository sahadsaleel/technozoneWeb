const Purchase = require('../models/Purchase');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private
const getPurchases = async (req, res) => {
  try {
    const { period } = req.query;
    const shopId = req.user.shopId;
    
    let query = { shopId };

    if (period) {
      const now = new Date();
      let startDate = new Date();
      if (period === 'weekly') {
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0,0,0,0);
      } else if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      query.date = { $gte: startDate };
    }

    const results = await Purchase.find(query).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new purchase
// @route   POST /api/purchases
// @access  Private
const createPurchase = async (req, res) => {
  try {
    const { supplierName, items, totalCost, paymentMethod, date, status, notes } = req.body;
    
    if (!supplierName || !items || !totalCost) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const purchase = await Purchase.create({
      shopId: req.user.shopId,
      addedBy: req.user._id,
      supplierName,
      items,
      totalCost,
      paymentMethod,
      date: date || new Date().toISOString(),
      status: status || 'Received',
      notes
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update purchase
// @route   PUT /api/purchases/:id
// @access  Private
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check for user shop match
    if (purchase.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body);
    res.json(updatedPurchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete purchase
// @route   DELETE /api/purchases/:id
// @access  Private
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check for user shop match
    if (purchase.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ id: req.params.id, message: 'Purchase removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase
};
