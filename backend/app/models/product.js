// Import the Mongoose library
var mongoose = require("mongoose");

// Access the Schema class from Mongoose
var Schema = mongoose.Schema;

// Define and export the Mongoose model for the "Product" entity
module.exports = mongoose.model(
  "Product",
  new Schema({
    name: String,
    quantity: Number,
    wishlist: { type: Boolean, default: false },
    desiredQuantity: { type: Number, default: 0 },
  })
);
