const Sale = require('../models/Sale');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
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

    const results = await Sale.find(query).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { customerName, items, totalAmount, paymentMethod, date, status, notes } = req.body;
    
    if (!customerName || !items || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const sale = await Sale.create({
      shopId: req.user.shopId,
      addedBy: req.user._id,
      customerName,
      items,
      totalAmount,
      paymentMethod,
      date: date || new Date().toISOString(),
      status: status || 'Completed',
      notes
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
const updateSale = async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Check for user shop match
    if (sale.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedSale = await Sale.findByIdAndUpdate(req.params.id, req.body);
    res.json(updatedSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Check for user shop match
    if (sale.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ id: req.params.id, message: 'Sale removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getSales,
  createSale,
  updateSale,
  deleteSale
};
