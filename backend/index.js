// Import necessary modules
const app = require("./app/app.js");
const mongoose = require("mongoose");

// Define the server port
const port = 8080;

// Define the MongoDB connection URL
const db_url = "mongodb://127.0.0.1:27017/";


/**
 * Configure mongoose
 * Set the Mongoose promise to the global promise and connect to the MongoDB database
 */
mongoose.Promise = global.Promise;
mongoose.connect(db_url).then(() => {
  console.log("Connected to Database");
  
  // Start the Express server to listen on the specified port
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
