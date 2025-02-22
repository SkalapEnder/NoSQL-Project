const express = require('express');
const router = express.Router();
const Brand = require('../../models/Brand');

// Get all brands
router.get("/", async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render("brands/index", { brands });
    } catch (err) {
        res.status(500).send("Error fetching brands");
    }
});

// Get a specific brand
router.get("/:id", async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).send("Brand not found");
        res.render("brands/show", { brand });
    } catch (err) {
        res.status(500).send("Error fetching brand");
    }
});

// Create a brand
router.post("/", async (req, res) => {
    try {
        const newBrand = new Brand(req.body);
        await newBrand.save();
        res.redirect("/brands");
    } catch (err) {
        res.status(500).send("Error creating brand");
    }
});

// Update a brand
router.put("/:id", async (req, res) => {
    try {
        await Brand.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/brands");
    } catch (err) {
        res.status(500).send("Error updating brand");
    }
});

// Delete a brand
router.delete("/:id", async (req, res) => {
    try {
        await Brand.findByIdAndDelete(req.params.id);
        res.redirect("/brands");
    } catch (err) {
        res.status(500).send("Error deleting brand");
    }
});

module.exports = router;
