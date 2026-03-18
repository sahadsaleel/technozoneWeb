const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');

// @desc    Get daily ledger
// @route   GET /api/ledger
// @access  Private
const getDailyLedger = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { date } = req.query; // Expecting YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23,59,59,999);

    // Get all data for this shop and date range
    const [sales, purchases, expenses] = await Promise.all([
      Sale.find({ shopId, date: { $gte: startOfDay, $lte: endOfDay } }),
      Purchase.find({ shopId, date: { $gte: startOfDay, $lte: endOfDay } }),
      Expense.find({ shopId, date: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    // Calculate totals
    const totalSales = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalPurchases = purchases.reduce((acc, p) => acc + (p.totalCost || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    res.json({
      date,
      sales,
      purchases,
      expenses,
      summary: {
        totalSales,
        totalPurchases,
        totalExpenses,
        netCash: totalSales - totalPurchases - totalExpenses
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDailyLedger
};
