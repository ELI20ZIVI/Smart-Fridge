// Import the Mongoose library
var mongoose = require("mongoose");

// Access the Schema class from Mongoose
var Schema = mongoose.Schema;

// Define and export the Mongoose model for the "Sensor" entity
module.exports = mongoose.model(
  "Sensor",
  new Schema({
    type: String,
    value: String,
  })
);
