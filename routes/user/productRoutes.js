const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Brand = require("../../models/Brand");
const Category = require("../../models/Category");
const brand = require("ejs");
const category = require("ejs");

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        const brands = await Brand.find();
        const categories = await Category.find();

        res.render("products/index", { products, brands, categories });
    } catch (err) {
        res.status(500).send("Error fetching products: " + err.message);
    }
});

// Get a specific product
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findOne({product_id: parseInt(req.params.id)});
        if (!product) return res.status(404).send("Product not found");
        res.render("products/show", { product });
    } catch (err) {
        res.status(500).send("Error fetching product" + err);
    }
});

router.post("/filter", async (req, res) => {
    try {
        const { name, min, max, brand, category } = req.body;

        const filter = {
            price: {
                $gte: isNaN(parseInt(min)) ? 1000 : parseInt(min),
                $lte: isNaN(parseInt(max)) ? 100000 : parseInt(max),
            },
        };

        // Add brand filter only if brand is provided and not empty
        if (brand && brand.trim() !== "") {
            filter["brand.name"] = { $regex: new RegExp(`^${brand}$`, "i") }; // Exact brand match (case-insensitive)
        }

        // Add category filter only if category is provided and not empty
        if (category && category.trim() !== "") {
            filter["category.name"] = { $regex: new RegExp(`^${category}$`, "i") }; // Exact category match (case-insensitive)
        }

        // Add name search filter (partial match, case-insensitive)
        if (name && name.trim() !== "") {
            filter.name = { $regex: new RegExp(name, "i") };
        }

        const products = await Product.find(filter);
        res.json(products);
    } catch (err) {
        console.error("Error fetching filtered products:", err);
        res.status(500).json({ error: "Error fetching products: " + err.message });
    }
});


router.get("/filter/:brand", async (req, res) => {
    try {
        const brandId = parseInt(req.params.brand);

        const products = await Product.find({"brand.id": brandId});
        const brands = await Brand.find();
        const categories = await Category.find();

        res.render("products/index", { products, brands, categories });
    } catch (err) {
        console.error("Error fetching filtered products:", err);
        res.status(500).json({ error: "Error fetching products: " + err.message });
    }
});


module.exports = router;
