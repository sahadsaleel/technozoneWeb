const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');

// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { period = 'monthly' } = req.query;

    const now = new Date();
    let startDate;
    let trendType = 'daily';

    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      trendType = 'monthly';
    } else {
      // default: monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // fetch all data in parallel
    const [filteredSales, filteredPurchases, filteredExpenses] = await Promise.all([
      Sale.find({ shopId, date: { $gte: startDate } }),
      Purchase.find({ shopId, date: { $gte: startDate } }),
      Expense.find({ shopId, date: { $gte: startDate } })
    ]);

    // summary totals
    const totalSalesAmount = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalPurchasesAmount = filteredPurchases.reduce((acc, p) => acc + (p.totalCost || 0), 0);
    const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const salesCount = filteredSales.length;

    // today's sales
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysSales = filteredSales
      .filter(s => new Date(s.date) >= todayStart)
      .reduce((acc, s) => acc + (s.totalAmount || 0), 0);

    // build trend data grouped by day or month
    const buildTrend = (data, amountField, type) => {
      const map = {};

      data.forEach(item => {
        const d = new Date(item.date);
        const key = type === 'daily'
          ? d.toISOString().split('T')[0]          // "2025-04-11"
          : `${d.getFullYear()}-${d.getMonth() + 1}`; // "2025-4"
        map[key] = (map[key] || 0) + (item[amountField] || 0);
      });

      return Object.entries(map)
        .map(([key, total]) => {
          if (type === 'daily') {
            return { date: key, name: key, total };
          }
          const [year, month] = key.split('-').map(Number);
          return { _id: { month, year }, name: key, total };
        })
        .sort((a, b) => {
          if (type === 'daily') return a.date.localeCompare(b.date);
          return (a._id.year - b._id.year) || (a._id.month - b._id.month);
        });
    };

    res.json({
      summary: {
        totalSales: totalSalesAmount,
        todaysSales,
        salesCount,
        totalPurchases: totalPurchasesAmount,
        totalExpenses: totalExpensesAmount,
      },
      trends: {
        sales: buildTrend(filteredSales, 'totalAmount', trendType),
        expenses: buildTrend(filteredExpenses, 'amount', trendType),
        type: trendType
      }
    });

  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardSummary };