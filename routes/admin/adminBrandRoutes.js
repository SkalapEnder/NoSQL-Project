const express = require('express');
const Brand = require('../../models/Brand');
const Product = require('../../models/Product');
const router = express.Router();

// Route to get all brands and render brands_admin.ejs
router.get("/", async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render("admin/brands_admin", { brands });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch brands" });
    }
});

// Route to create a new brand (POST)
router.post("/", async (req, res) => {
    try {
        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
        }

        const { brand_id, name, description, headquarters, website, founded_year } = req.body;
        if (!brand_id || !name) return res.render('templates/error',{ errorMessage: "Brand name and id is required" });

        const existingBrand = await Brand.findOne({ brand_id: brand_id });
        if (existingBrand) {
            return res.render('templates/error',{ errorMessage: "Brand ID already exists" });
        }

        const newBrand = new Brand({
            brand_id,
            brand_name: name,
            brand_description: description,
            headquarters: headquarters,
            website: website,
            founded_year
        });
        await newBrand.save();

        res.redirect("/brands/admin");
    } catch (err) {
        return res.render('templates/error',{ errorMessage: "Failed to create brand" });
    }
});

// Update Category
router.put("/:id", async (req, res) => {
    try {
        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
        }

        const { brand_id, name, description, headquarters, founded_year, website } = req.body;

        if (!brand_id || !name || !description || !headquarters || !founded_year || !website) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find and update the brand
        const updatedBrand = await Brand.findOneAndUpdate(
            { brand_id: brand_id },
            {
                brand_name: name,
                brand_description: description,
                headquarters,
                founded_year,
                website,
            },
            {new: true}
        );

        if (!updatedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }

        // Update brand name in all relevant products
        await Product.updateMany(
            { "brand.id": req.params.id },
            { $set: { "brand.name": name } }
        );
        console.log('Here!')
        res.status(200).json({ message: "Brand updated successfully" });
    } catch (err) {
        console.error("Error updating brand:", err);
        res.status(500).json({ error: "Failed to update brand" });
    }
});

// Delete Category
router.delete("/:id", async (req, res) => {
    try {
        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
        }
        // Delete all products associated with the brand
        const resp = await Product.deleteMany({ "brand.id": parseInt(req.params.id) });

        if (!resp.acknowledged) {
            return res.status(501).json({ error: "Failed to delete products for this brand" });
        }

        // Delete the brand itself
        const deletedBrand = await Brand.findOneAndDelete({brand_id: parseInt(req.params.id)});

        if (!deletedBrand) {
            return res.status(503).json({ error: "Brand not found" });
        }

        return res.status(200).json({ message: "Brand and related products deleted successfully" });
    } catch (err) {
        console.error("Error deleting brand:", err);
        return res.status(500).json({ error: "Failed to delete brand" });
    }
});


module.exports = router;