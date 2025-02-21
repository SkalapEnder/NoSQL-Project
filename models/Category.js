const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    category_id: { type: Number, required: true, unique: true },
    category_name: { type: String, required: true },
    category_description: { type: String }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;