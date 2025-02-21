const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Product: Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.render("products/index", { products });
    } catch (err) {
        res.status(500).send("Error fetching products");
    }
});

// Get a specific product
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Product not found");
        res.render("products/show", { product });
    } catch (err) {
        res.status(500).send("Error fetching product");
    }
});

// Create a product
router.post("/", async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect("/products");
    } catch (err) {
        res.status(500).send("Error creating product");
    }
});

// Update a product
router.put("/:id", async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/products");
    } catch (err) {
        res.status(500).send("Error updating product");
    }
});

// Delete a product
router.delete("/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/products");
    } catch (err) {
        res.status(500).send("Error deleting product");
    }
});

module.exports = router;
