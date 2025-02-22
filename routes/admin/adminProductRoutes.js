const express = require('express');
const Brand = require('../../models/Brand');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const { updateDailyTVProducts } = require("../../scripts/scraper");
const router = express.Router();

router.get("/", async (req, res) => {
    if(req.session.userStatus === 'user'){
        return res.render("/");
    }

    try {
        const products = await Product.find();
        const brands = await Brand.find();
        const categories = await Category.find();
        if (!products || !brands || !categories) {
            return res.render("templates/error", { errorMessage: "No products, brands or categories found" });
        }
        res.render("admin/products_admin", { products, brands, categories });
    } catch (err) {
        res.render("templates/error", { errorMessage: "Error getting products: " + err });
    }
});

router.post("/", async (req, res) => {
    try {
        // Ensure only admins can create a product
        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", { errorMessage: "Unauthorized. Please, login to admin" });
        }

        const { product_id, name, model, description, price, available, diagonal, brand, category, url, pictures } = req.body;

        // Filter out empty picture URLs
        const imageArray = Array.isArray(pictures) ? pictures.filter(pic => pic.trim() !== "") : [];

        // Fetch brand details
        const brandData = await Brand.findOne({ brand_id: brand }).select("brand_id brand_name");

        // Fetch category details
        const categoryData = await Category.findOne({ category_id: category }).select("category_id category_name");

        if (!brandData || !categoryData) {
            return res.render("templates/error", { errorMessage: "Invalid brand or category" });
        }

        // Create new product with brand & category details
        const newProduct = new Product({
            product_id,
            name,
            model,
            description,
            price,
            quantity: parseInt(available),
            diagonal,
            brand: {
                id: brandData.brand_id,
                name: brandData.brand_name,
            },
            category: {
                id: categoryData.category_id,
                name: categoryData.category_name,
            },
            url,
            pictures: imageArray,
        });

        await newProduct.save();
        res.redirect("/products/admin");
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).send("Error creating product");
    }
});


router.put("/:id", async (req, res) => {
    try {
        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
        }

        await Product.findOneAndUpdate({product_id: parseInt(req.params.id)}, req.body);
        res.status(200).json({success: true});
    } catch (err) {
        res.status(500).send("Error updating product");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
        }

        await Product.findOneAndDelete({product_id: parseInt(req.params.id)});
        res.status(200).json({success: true});
    } catch (err) {
        res.status(500).json({message: "Error deleting product"});
    }
});

router.post("/scrape", async (req, res) => {
    try {
        await updateDailyTVProducts();
        res.json({ message: "Scraping started successfully!" });
    } catch (err) {
        console.error("Scraping error:", err);

        // Make sure to send only ONE response
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to start scraping." });
        }
    }
});

module.exports = router;