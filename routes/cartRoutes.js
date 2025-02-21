const express = require('express');
const User = require('../models/User');
const Cart = require('../models/Cart');
const mongoose = require("mongoose");
require('dotenv').config();
const router = express.Router();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Cart: Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

module.exports = router;