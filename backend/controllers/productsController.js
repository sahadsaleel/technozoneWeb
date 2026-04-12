const Product = require('../models/Product');


const getProducts = async (req, res) => {
  try {
    const results = await Product.find({ shopId: req.user.shopId }).sort({ name: 1 });

    // map costPrice → purchasePrice, price → sellingPrice for frontend
    const mapped = results.map(p => ({
      ...p.toObject(),
      purchasePrice: p.costPrice,
      sellingPrice: p.price
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};


const createProduct = async (req, res) => {
  try {
    const { name, purchasePrice, sellingPrice } = req.body;

    if (!name || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const costPrice = parseFloat(purchasePrice);
    const price = parseFloat(sellingPrice);
    const margin = price - costPrice;

    const product = await Product.create({
      shopId: req.user.shopId,
      addedBy: req.user._id,
      name,
      costPrice,
      price,
      margin,
      date: new Date().toISOString()
    });

    // return with frontend-friendly field names
    res.status(201).json({
      ...product.toObject(),
      purchasePrice: product.costPrice,
      sellingPrice: product.price
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.shopId.toString() !== req.user.shopId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { name, purchasePrice, sellingPrice } = req.body;
    const costPrice = parseFloat(purchasePrice);
    const price = parseFloat(sellingPrice);
    const margin = price - costPrice;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { name, costPrice, price, margin } },
      { new: true, runValidators: true }
    );

    res.json({
      ...updated.toObject(),
      purchasePrice: updated.costPrice,
      sellingPrice: updated.price
    });
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
