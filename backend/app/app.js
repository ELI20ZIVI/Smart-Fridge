// Import necessary modules
const express = require("express");
const app = express();
const cors = require("cors");
const Serial = require("raspi-serial").Serial;
const Sensor = require("./models/sensor");
const productApi = require("./product.js");
const sensorApi = require("./sensor.js");
const wishlistApi = require("./wishlist.js");
const morgan = require("morgan");
const { spawn } = require("child_process");

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS requests handler
 */
app.use(cors());

// Middleware to log requests
app.use(morgan("short"));

/**
 * Serve front-end static files
 */
app.use("/", express.static("static"));

// Mount API routes
app.use("/product", productApi);
app.use("/sensor", sensorApi);
app.use("/wishlist", wishlistApi);

// Default 404 handler
app.use((req, res) => {
  res.status(404);
  res.json({ error: "Not foundddd" });
});

// Define the serial port
const serial = new Serial({
  portId: "/dev/ttyS0",
  baudRate: 9600,
});

// Variable to accumulate received data from serial
let receivedData = "";

// Listen for data events from the serial port
serial.on("data", (data) => {
  receivedData += data.toString("utf-8");

  // Check if the received data contains the end of the message
  if (receivedData.includes("\0")) {
    // Process the complete message
    console.log("Received complete data: " + receivedData);

    // Save data on DB
    saveData(receivedData);

    // Clear the accumulated data for the next message
    receivedData = "";
  }
});

// Opening serial port
serial.open(() => {
  console.log("serial opened");
});

// Handle serial port errors
serial.on("error", (err) => {
  console.error(`Serial port error: ${err.message}`);
});

// pyton file fpr the image recognition
const pythonScript = "AI/imageRecognition.py";

// Spawn the Python script as a child process
const pythonProcess = spawn("python", [pythonScript]);

// Listen for output events from the Python script
pythonProcess.stdout.on("data", (data) => {
  console.log("Python script output:" + data);
});

// Listen for error events from the Python script
pythonProcess.stderr.on("data", (data) => {
  console.error("Error from Python script:" + data);
});

// Listen for close events from the Python script
pythonProcess.on("close", (code) => {
  console.log("Python script process exited with code " + code);
  pythonProcess.stdin.end(); // Ensure that stdin is closed when the script exits
});

setInterval(() => {
  pythonProcess.stdin.write("takePhoto\n");
}, 5000);
// Asynchronous function to save sonsors data to the database
async function saveData(data) {
  try {
    // Cleaning the input
    const trimmedData = data.trim().replace(/\0/g, "");

    // transforming data into json format
    const dataJson = JSON.parse(trimmedData);

    // checking if the sensor i'm trying to save already exist in my DB
    let sensor = await Sensor.findOne({ type: dataJson.type });

    // if the sensor exist modify the existing one else create a new one
    if (sensor) {
      sensor.value = dataJson.value;
    } else {
      sensor = new Sensor({
        type: dataJson.type,
        value: dataJson.value,
      });
    }

    // if the fridge door is being close i take a picture to the products
    /*
    if (sensor.type == "door" && sensor.value == "closed") {
      setTimeout(pythonProcess.stdin.write("takePhoto\n"), 3000);
    }
*/
    await sensor.save();
  } catch (error) {
    console.error(error);
  }
}

// Handle Ctrl+C (SIGINT) to close the serial port before exiting
process.on("SIGINT", () => {
  // Close the serial port when Ctrl+C is pressed
  serial.close((err) => {
    if (err) {
      console.error("Error closing serial port:", err.message);
    } else {
      console.log("\nSerial port closed.");
      process.exit(); // Terminate the Node.js process after closing the port
    }
  });
});

module.exports = app;
