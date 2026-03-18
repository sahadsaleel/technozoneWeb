const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { getSales, createSale, updateSale, deleteSale } = require('../controllers/salesController');
const { getPurchases, createPurchase, updatePurchase, deletePurchase } = require('../controllers/purchasesController');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expensesController');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productsController');
const { getDashboardSummary } = require('../controllers/reportsController');
const { getDailyLedger } = require('../controllers/ledgerController');

// All API routes below require authentication
router.use(protect);

// Sales
router.route('/sales')
  .get(getSales)
  .post(createSale);
router.route('/sales/:id')
  .put(updateSale)
  .delete(deleteSale);

// Purchases
router.route('/purchases')
  .get(getPurchases)
  .post(createPurchase);
router.route('/purchases/:id')
  .put(updatePurchase)
  .delete(deletePurchase);

// Expenses
router.route('/expenses')
  .get(getExpenses)
  .post(createExpense);
router.route('/expenses/:id')
  .put(updateExpense)
  .delete(deleteExpense);

// Products
router.route('/products')
  .get(getProducts)
  .post(createProduct);
router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Reports
router.get('/reports/dashboard', getDashboardSummary);
router.get('/ledger', getDailyLedger);

module.exports = router;
