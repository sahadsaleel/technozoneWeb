const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
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

    const results = await Expense.find(query).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { category, amount, description, paymentMethod, date, receiptUrl } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const expense = await Expense.create({
      shopId: req.user.shopId,
      addedBy: req.user._id,
      category,
      amount,
      description,
      paymentMethod,
      date: date || new Date().toISOString(),
      receiptUrl
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check for user shop match
    if (expense.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body);
    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check for user shop match
    if (expense.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ id: req.params.id, message: 'Expense removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
