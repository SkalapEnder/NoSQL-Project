const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    brand_id: { type: Number, required: true, unique: true },
    brand_name: { type: String, required: true, unique: true },
    brand_description: { type: String },
    headquarters: { type: String },
    founded_year: { type: Number },
    website: { type: String }
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;