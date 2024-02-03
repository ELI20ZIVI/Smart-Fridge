// Import necessary modules and models
const express = require("express");
const router = express.Router();
const Product = require("./models/product");

// route definitions
router.get("/", getProducts);
router.put("/addProduct", addProduct);
router.get("/missingProducts", missingProducts);
router.put("/removeProduct", removeProduct);

// Function to get products in the wishlist
async function getProducts(req, res) {
  try {
    // Fetch products in the wishlist from the database, excluding _id, __v, quantity and wishlist fields
    const products = await Product.find(
      { wishlist: true },
      { _id: 0, __v: 0, quantity: 0, wishlist: 0 }
    );

    // Map the retrieved products to a simplified format
    const productsElaborated = products.map((product) => ({
      name: product.name,
      quantity: product.desiredQuantity,
    }));

    // Respond with the elaborated product data
    res.status(200).json(productsElaborated);
    return;
  } catch (error) {
    console.error("Error while fetching products: ", error);
    res
      .status(500)
      .json({ success: false, error: "Error while fetching products" });
  }
}

// Function to add a product to the wishlist
async function addProduct(req, res) {
  try {
    // Extract product details from the request body
    const productName = req.body.name;
    const productQuantity = req.body.quantity;

    // Find the product in the database
    const product = await Product.findOne({ name: productName });

    // Check if the product is available in the database
    if (!product) {
      console.error("Product not available in the list");
      res
        .json({
          success: false,
          message: "Product not available in the list",
        })
        .status(404);
      return;
    }

    // Product quantity cannot be 0
    if (productQuantity == 0) {
      res.status(403).json({ success: false, message: "quantity cannot be 0" });
      return;
    }

    // Update the product details
    product.wishlist = true;
    product.desiredQuantity = productQuantity;

    // Save the updated product details to the database
    await product.save();

    // Respond with a success message
    res
      .json({ success: true, message: "product added to the wishlist" })
      .status(200);
    return;
  } catch (error) {
    console.error("Error while adding product to the wishlist: ", error);
    res.status(500).json({
      success: false,
      error: "Error while adding product to the wishlist",
    });
    return;
  }
}

// Function to get products that are in the wishlist and missing from the fridge
async function missingProducts(req, res) {
  try {
    // Fetch products in the wishlist and missing from the fridge, excluding specific fields
    const products = await Product.find(
      { wishlist: true, $expr: { $lt: ["$quantity", "$desiredQuantity"] } },
      { _id: 0, __v: 0 }
    );

    // Check if any products are missing from the fridge
    if (!products) {
      res.json({});
      return;
    }

    // Map the retrieved products to a simplified format
    const productsElaborated = products.map((product) => ({
      name: product.name,
      quantity: product.desiredQuantity - product.quantity,
    }));

    // Respond with the elaborated product data
    res.status(200).json(productsElaborated);
    return;
  } catch (error) {
    console.error("Error while fetching products: ", error);
    res
      .status(500)
      .json({ success: false, error: "Error while fetching products" });
    return;
  }
}

// Function to remove a product from the wishlist
async function removeProduct(req, res) {
  try {
    // Extract product name from the request body
    const productName = req.body.name;

    // Find the product in the database
    const product = await Product.findOne({ name: productName });

    // Check if the product is available in the database
    if (!product) {
      console.error("Product not available in the list");
      res
        .json({
          success: false,
          message: "Product not available in the list",
        })
        .status(404);
      return;
    }

    // Update the product details
    product.wishlist = false;
    product.desiredQuantity = 0;

    // Save the updated product details to the database
    await product.save();

    // Respond with a success message
    res
      .json({ success: true, message: "product removed from the wishlist" })
      .status(200);
    return;
  } catch (error) {
    console.error("Error while removing product: ", error);
    res
      .status(500)
      .json({ success: false, error: "Error while removing product" });
    return;
  }
}

module.exports = router;