const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_id: { type: Number, required: true, index: true },
    name: { type: String, required: true, index: true },
    model: {type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    url: { type: String, required: true },
    diagonal: { type: Number },
    description: { type: String },
    brand: {
        id: { type: Number },
        name: { type: String }
    },
    category: {
        id: { type: Number },
        name: { type: String }
    },
    pictures: [{ type: String }],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
