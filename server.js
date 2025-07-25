const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// MongoDB connection string (replace with your actual MongoDB connection string in production)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eltoro_slms';

// MongoDB Schema for device data
const deviceSchema = new mongoose.Schema({
  dId: String,
  p: { type: Number, default: 0 },  // POWER (0 or 1)
  s: { type: Number, default: 0 },  // SWITCH (0 or 1)
  l: { type: Number, default: 0 },  // LIGHT (value or 0)
  t: { type: String, default: null },  // Time or Temperature
  i: { type: Number, default: 0 },  // Current
  b: { type: Number, default: 0 },  // Battery
  e: { type: String, default: null }, // Extra parameter
  timestamp: { type: String, required: true }
});

const Device = mongoose.model('Device', deviceSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes

// Get all devices
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find().sort({ timestamp: -1 });
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get a specific device by ID
app.get('/api/devices/:id', async (req, res) => {
  try {
    const device = await Device.findOne({ dId: req.params.id }).sort({ timestamp: -1 });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Get dashboard data (aggregated stats)
app.get('/api/dashboard', async (req, res) => {
  try {
    // Get the latest status of each device
    const devices = await Device.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$dId", latestDoc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latestDoc" } }
    ]);

    // Calculate uptime percentage
    const onlineDevices = devices.filter(device => device.p === true);
    const uptimePercentage = devices.length > 0 ? 
      ((onlineDevices.length / devices.length) * 100).toFixed(1) : 0;

    // Count devices by status
    const boardStatus = {
      online: devices.filter(device => device.p === true && device.l === true).length,
      offline: devices.filter(device => device.p === true && device.l === false).length,
      power_off: devices.filter(device => device.p === false).length
    };

    // Generate uptime history (last 24 hours)
    // In a real app, this would query historical data from MongoDB
    const uptimeHistory = Array.from({ length: 24 }, () => 
      Math.floor(Math.random() * 20) + 80
    );

    // Get recent outages
    // In a real app, this would query actual outage events from MongoDB
    const outages = [
      { date: '2025-07-24', duration: '45 minutes', reason: 'Network issue' },
      { date: '2025-07-22', duration: '2 hours', reason: 'Scheduled maintenance' },
      { date: '2025-07-20', duration: '15 minutes', reason: 'Power outage' },
      { date: '2025-07-19', duration: '30 minutes', reason: 'Server restart' },
      { date: '2025-07-18', duration: '1 hour', reason: 'Database maintenance' }
    ];

    res.json({
      devices,
      uptimePercentage,
      boardStatus,
      uptimeHistory,
      outages
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Fetch data from JSP endpoint and store in MongoDB
async function fetchAndStoreData() {
  try {
    const response = await axios.get('http://103.140.194.188:6050/iothub/show.jsp');
    const data = response.data;
    
    // Process and store the data
    if (Array.isArray(data)) {
      for (const item of data) {
        // Create a new device document
        const deviceData = {
          dId: item.dId,
          p: item.p !== undefined ? item.p : 0,
          s: item.s !== undefined ? item.s : 0,
          l: item.l !== undefined ? item.l : 0,
          t: item.t !== undefined ? item.t : null,
          i: item.i !== undefined ? item.i : 0,
          b: item.b !== undefined ? item.b : 0,
          e: item.e !== undefined ? item.e : null,
          timestamp: new Date().toISOString().replace(/[-:]/g, '').substring(0, 14)
        };
        
        // Save to MongoDB
        await Device.create(deviceData);
      }
      console.log(`Stored ${data.length} device records in MongoDB`);
    } else {
      console.error('Invalid data format from JSP endpoint');
    }
  } catch (error) {
    console.error('Error fetching data from JSP endpoint:', error);
  }
}

// Initialize MongoDB with sample data if no data exists
async function initializeMongoDBWithSampleData() {
  try {
    // Check if there's any data in the collection
    const count = await Device.countDocuments();
    
    if (count === 0) {
      console.log('No data found in MongoDB. Initializing with sample data...');
      
      // Sample data provided by the user
      const sampleData = [
        {"DEV002": {"p": 1, "b": 0, "s": 0, "dId": "DEV002", "timestamp": "20250713111913"}},
        {"DEV001": {"p": 1, "b": 0, "s": 0, "dId": "DEV001", "timestamp": "20250713111901"}},
        {"DEV004": {"p": 1, "b": 0, "s": 0, "dId": "DEV004", "timestamp": "20250713112306"}},
        {"DEV003": {"p": 1, "b": 0, "s": 0, "dId": "DEV003", "timestamp": "20250713111919"}},
        {"DEV00002": {"s": 1, "e": "qwe", "dId": "DEV00002", "timestamp": "20250713204636"}},
        {"DEV010": {"p": 1, "b": 0, "s": 0, "dId": "DEV010", "timestamp": "20250714051447"}},
        {"DEV010": {"p": 1, "b": 0, "s": 0, "dId": "DEV010", "timestamp": "20250713112338"}},
        {"LBC0001": {"p": 0, "b": 1, "s": 0, "t": "11:28:55", "i": 0, "l": 1134, "dId": "LBC0001", "timestamp": "20250725112907"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:28:34", "dId": "LBC0001", "timestamp": "20250725112847"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:27:12", "dId": "LBC0001", "timestamp": "20250725112724"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:26:58", "dId": "LBC0001", "timestamp": "20250725112711"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:25:41", "i": 0, "l": 2254, "dId": "LBC0001", "timestamp": "20250725112554"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:22:28", "i": 0, "l": 2283, "dId": "LBC0001", "timestamp": "20250725112240"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:19:15", "i": 0, "l": 2317, "dId": "LBC0001", "timestamp": "20250725111927"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:16:43", "dId": "LBC0001", "timestamp": "20250725111656"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:13:44", "dId": "LBC0001", "timestamp": "20250725111356"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:13:31", "dId": "LBC0001", "timestamp": "20250725111343"}},
        {"LBC0001": {"p": 0, "b": 1, "s": 0, "t": "11:12:27", "i": 29, "l": 682, "dId": "LBC0001", "timestamp": "20250725111240"}},
        {"LBC0001": {"p": 0, "b": 1, "s": 0, "t": "11:09:14", "i": 22, "l": 611, "dId": "LBC0001", "timestamp": "20250725110926"}},
        {"LBC0001": {"p": 0, "b": 0, "s": 0, "t": "11:06:14", "dId": "LBC0001", "timestamp": "20250725110626"}},
        {"dev002": {"p": 1, "b": 0, "s": 3, "dId": "dev002", "timestamp": "20250716154857"}},
        {"dev002": {"p": 1, "b": 0, "s": 3, "dId": "dev002", "timestamp": "20250716154739"}},
        {"DEV009": {"p": 1, "b": 0, "s": 0, "dId": "DEV009", "timestamp": "20250713112332"}},
        {"DEV006": {"p": 1, "b": 0, "s": 0, "dId": "DEV006", "timestamp": "20250713112317"}},
        {"DEV005": {"p": 1, "b": 0, "s": 0, "dId": "DEV005", "timestamp": "20250713112312"}},
        {"DEV008": {"p": 1, "b": 0, "s": 0, "dId": "DEV008", "timestamp": "20250713112327"}}
      ];
      
      // Insert each device record
      for (const item of sampleData) {
        const deviceId = Object.keys(item)[0];
        const deviceData = item[deviceId];
        
        await Device.create({
          dId: deviceData.dId,
          p: deviceData.p !== undefined ? deviceData.p : 0,
          s: deviceData.s !== undefined ? deviceData.s : 0,
          l: deviceData.l !== undefined ? deviceData.l : 0,
          t: deviceData.t !== undefined ? deviceData.t : null,
          i: deviceData.i !== undefined ? deviceData.i : 0,
          b: deviceData.b !== undefined ? deviceData.b : 0,
          e: deviceData.e !== undefined ? deviceData.e : null,
          timestamp: deviceData.timestamp
        });
      }
      
      console.log(`Initialized MongoDB with ${sampleData.length} sample device records`);
    } else {
      console.log(`Found ${count} existing records in MongoDB`);
    }
  } catch (error) {
    console.error('Error initializing MongoDB with sample data:', error);
  }
}

// Initialize MongoDB with sample data and then fetch data every minute
mongoose.connection.once('open', async () => {
  await initializeMongoDBWithSampleData();
  fetchAndStoreData();
  setInterval(fetchAndStoreData, 60000);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});