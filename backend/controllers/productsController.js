const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const results = await Product.find({ shopId: req.user.shopId }).sort({ name: 1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { name, purchasePrice, sellingPrice } = req.body;
    
    if (!name || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await Product.create({
      shopId: req.user.shopId,
      addedBy: req.user._id,
      name,
      costPrice: parseFloat(purchasePrice),
      price: parseFloat(sellingPrice),
      date: new Date().toISOString()
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ id: req.params.id, message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
