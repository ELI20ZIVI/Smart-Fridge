// Import necessary modules and models
const express = require("express");
const router = express.Router();
const Product = require("./models/product");

// route definitions
router.get("/all", allProducts);
router.get("/status", productsStatus);

// function to retrieve all products
async function allProducts(req, res) {
  try {
    // Fetch all products from the database, excluding _id and __v fields
    const products = await Product.find({}, { _id: 0, __v: 0 });
    res.status(200).json(products);
    return;
  } catch (error) {
    console.error("Error while fetching products: ", error);
    res
      .status(500)
      .json({ success: false, error: "error while fetching products" });
  }
}

// function to retrieve all products with non-zero quantity
async function productsStatus(req, res) {
  try {
    // Fetch products with non-zero quantity from the database, excluding _id and __v fields
    const products = await Product.find(
      { quantity: { $ne: 0 } },
      { _id: 0, __v: 0 }
    );

    res.status(200).json(products);
    return;
  } catch (error) {
    console.error("Error while fetching products: ", error);
    res
      .status(500)
      .json({ success: false, error: "error while fetching products" });
  }
}

module.exports = router;
