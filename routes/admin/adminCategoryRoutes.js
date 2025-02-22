const express = require('express');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const router = express.Router();

// ✅ GET all categories and render the categories_admin.ejs page
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("admin/categories_admin", { categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).send("Error fetching categories");
    }
});

// ✅ POST route to create a new category
router.post("/", async (req, res) => {
    try {
        const { category_id, category_name, category_description } = req.body;

        const existingCategory = await Category.findOne({ category_id: category_id });
        if (existingCategory) {
            return res.status(400).send("Category ID already exists");
        }

        const newCategory = new Category({
            category_id,
            category_name,
            category_description
        });

        await newCategory.save();
        res.status(200).json({success: true});
    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).send("Error creating category");
    }
});

// Update Category
router.put("/:id", async (req, res) => {
    try {
        const { name, description } = req.body;

        // Find and update the category
        const updatedCategory = await Category.findOneAndUpdate(
            { category_id: req.params.id },
            { category_name: name, category_description: description },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Update all products associated with this category
        await Product.updateMany(
            { "category.id": req.params.id },
            { "category.name": name }
        );

        res.status(200).json({ message: "Category and related products updated successfully" });
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ error: "Failed to update category and related products" });
    }
});


// Delete Category
router.delete("/:id", async (req, res) => {
    try {
        // First, delete all products associated with this category
        const deleteProducts = await Product.deleteMany({ "category.id": req.params.id });

        if (!deleteProducts.acknowledged) {
            return res.status(404).json({ error: "Related Products not deleted" });
        }

        // Then, delete the category itself
        const deletedCategory = await Category.findOneAndDelete({ category_id: req.params.id });

        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.status(200).json({ message: "Category and related products deleted successfully" });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ error: "Failed to delete category and related products" });
    }
});

module.exports = router;