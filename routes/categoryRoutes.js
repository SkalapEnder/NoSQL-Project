const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Category: Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("categories/index", { categories });
    } catch (err) {
        res.status(500).send("Error fetching categories");
    }
});

// Get a specific category
router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send("Category not found");
        res.render("categories/show", { category });
    } catch (err) {
        res.status(500).send("Error fetching category");
    }
});

// Create a category
router.post("/", async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.redirect("/categories");
    } catch (err) {
        res.status(500).send("Error creating category");
    }
});

// Update a category
router.put("/:id", async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/categories");
    } catch (err) {
        res.status(500).send("Error updating category");
    }
});

// Delete a category
router.delete("/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect("/categories");
    } catch (err) {
        res.status(500).send("Error deleting category");
    }
});

module.exports = router;
