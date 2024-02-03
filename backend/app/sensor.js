// Import necessary modules and models
const express = require("express");
const router = express.Router();
const Sensor = require("./models/sensor");

// Route to get data from all sensors
router.get("/all", allSensors);

// Function to retrieve data from all sensors
async function allSensors(req, res) {
  try {
    // Fetch data from all sensors from the database, excluding _id and __v fields
    const temperature = await Sensor.findOne(
      { type: "temperature" },
      { _id: 0, __v: 0 }
    );
    const door = await Sensor.findOne({ type: "door" }, { _id: 0, __v: 0 });
    const humidity = await Sensor.findOne(
      { type: "humidity" },
      { _id: 0, __v: 0 }
    );

    // Check if any sensor data is missing
    if(!temperature || !door || !humidity){
      res.status(500).json({"success" : false, "error": "sensor data not available"});
      return;
    }

    // Create a JSON object with sensor data
    const sensors = {
      temperature: temperature.value,
      door: door.value,
      humidity: humidity.value,
    };

    // Send the JSON object as response
    res.status(200).json(sensors);
    return;
  } catch (error) {
    console.error("Error while fetching sensors: ", error);
    res.status(500).json({"success" : false, "error": "error while fetching sensors"})
    return;
  }
}

module.exports = router;