const mongoose = require("mongoose");
require('dotenv').config();
let isConnected = false; // Track connection status

async function connectDB() {
    if (isConnected) {
        console.log("⚡ Using existing MongoDB connection");
        return mongoose.connection;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        isConnected = true;
        console.log("✅ Connected to MongoDB Atlas");
        return mongoose.connection;
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        throw err; // Re-throw for error handling
    }
}


module.exports = connectDB;
