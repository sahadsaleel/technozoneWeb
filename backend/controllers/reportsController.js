const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { period = 'monthly' } = req.query; // weekly, monthly, yearly
    
    const now = new Date();
    let startDate = new Date();
    let trendType = 'daily'; // 'daily' or 'monthly'

    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0,0,0,0);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      trendType = 'monthly';
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get filtered data using Mongoose
    const [filteredSales, filteredPurchases, filteredExpenses] = await Promise.all([
      Sale.find({ shopId, date: { $gte: startDate } }),
      Purchase.find({ shopId, date: { $gte: startDate } }),
      Expense.find({ shopId, date: { $gte: startDate } })
    ]);

    // 1. Summary Stats (based on filtered data)
    const totalSalesAmount = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const salesCount = filteredSales.length;
    const totalPurchasesAmount = filteredPurchases.reduce((acc, p) => acc + (p.totalCost || 0), 0);
    const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // 2. Trend Generation
    const getTrend = (data, amountField, type) => {
      const trendMap = {};
      
      data.forEach(item => {
        const d = new Date(item.date);
        if (d >= startDate) {
          let key;
          if (type === 'daily') {
            key = d.toISOString().split('T')[0]; // YYYY-MM-DD
          } else {
            key = `${d.getFullYear()}-${d.getMonth() + 1}`; // YYYY-M
          }
          trendMap[key] = (trendMap[key] || 0) + (item[amountField] || 0);
        }
      });

      return Object.keys(trendMap).map(key => {
        if (type === 'daily') {
          return { name: key, total: trendMap[key], date: key };
        } else {
          const [year, month] = key.split('-').map(Number);
          return { _id: { month, year }, total: trendMap[key], name: key };
        }
      }).sort((a, b) => {
        if (type === 'daily') return a.name.localeCompare(b.name);
        return (a._id.year - b._id.year) || (a._id.month - b._id.month);
      });
    };

    const salesTrend = getTrend(filteredSales, 'totalAmount', trendType);
    const expensesTrend = getTrend(filteredExpenses, 'amount', trendType);

    res.json({
      summary: {
        totalSales: totalSalesAmount,
        salesCount: salesCount,
        totalPurchases: totalPurchasesAmount,
        totalExpenses: totalExpensesAmount,
      },
      trends: {
        sales: salesTrend,
        expenses: expensesTrend,
        type: trendType
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardSummary
};
