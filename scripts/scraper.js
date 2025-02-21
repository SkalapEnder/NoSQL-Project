require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const xml2js = require("xml2js");
const cheerio = require('cheerio');
const iconv = require("iconv-lite");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Scraper: Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// YML Feed URL
const YML_URL = "https://shop.kz/bitrix/catalog_export/yandex.php";

// Fetch YML Data
async function fetchYML() {
    try {
        const response = await axios.get(YML_URL, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            timeout: 10000
        });
         // Change to "utf-8" if needed
        return iconv.decode(response.data, "win1251");
    } catch (error) {
        console.error("❌ Error fetching YML:", error.message);
        return null;
    }
}

// Parse XML and Extract TV Products
async function extractTVProducts(xmlData) {
    const parser = new xml2js.Parser({ explicitArray: false });
    const jsonData = await parser.parseStringPromise(xmlData);

    const offers = jsonData.yml_catalog.shop.offers.offer;
    const tvProducts = [];

    for (const offer of offers) {
        if (parseInt(offer.categoryId) !== 274 || offer.vendor === 'Rombica') continue;

        const {brand_id, brand_name} = await getBrand(offer.vendor);
        if (!brand_id) continue;

        const {category_id, category_name} = await getCategory(offer.url);

        try {
            const productData = {
                product_id: parseInt(offer.$.id),
                name: offer.name,
                model: offer.vendorCode || "Unknown Model",
                price: parseInt(offer.price),
                currency: offer.currencyId,
                quantity: offer.$.available === "true" ? 10 : 0,
                diagonal: extractDiagonal(offer.name, offer.vendorCode),
                description: offer.description?.trim() || "",
                url: offer.url || "",
                available: offer.$.available === "true",
                brand: {
                    id: brand_id,
                    name: brand_name
                },
                category: {
                    id: category_id,
                    name: category_name
                },
                pictures: Array.isArray(offer.picture) ? offer.picture : [offer.picture]
            };

            tvProducts.push(productData);
        } catch (err) {
            console.error("❌ Error processing product:", err.message);
        }
    }

    return tvProducts;
}

// Extract Diagonal Size (inches) from Name
function extractDiagonal(name, model) {
    const regex = /(\d{2,3})/; // Matches first 2-3 digit number (e.g., 55, 65, 100)

    if (name) {
        const nameMatch = name.match(regex);
        if (nameMatch) return parseInt(nameMatch[1]); // Return if found in name
    }

    if (model) {
        const modelMatch = model.match(regex);
        if (modelMatch) return parseInt(modelMatch[1]); // Return if found in model
    }

    return null; // No diagonal found
}


// Re-upload TV Products Daily
async function updateDailyTVProducts() {
    console.log("🔄 Checking TV product collection...");

    const productCount = await Product.countDocuments();

    if (productCount > 0) {
        console.log("🗑️ Removing old TV products...");
        await Product.deleteMany({});
    }

    console.log("📥 Fetching new TV product data...");
    const xmlData = await fetchYML();
    if (!xmlData) return;

    const tvProducts = await extractTVProducts(xmlData);
    if (tvProducts.length === 0) {
        console.log("⚠️ No TV products found.");
        return;
    }

    await Product.insertMany(tvProducts);
    console.log(`✅ Inserted ${tvProducts.length} TV products into MongoDB.`);
}

async function getBrand(brandName) {
    const brand = await Brand.findOne({ brand_name: brandName });
    if (brand === null) return { brand_id: null, brand_name: null };

    return { brand_id: brand.brand_id, brand_name: brand.brand_name };
}

async function getCategory(url) {
    const tvType = await getTVType(url);
    const category = await Category.findOne({category_name: tvType});
    if(!category)
        return { category_id: null, category_name: null };

    return { category_id: category.category_id, category_name: category.category_name };
}

async function getTVType(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let tvType = null;
        const types = ["OLED", "QLED", "Direct LED", "LED"];

        $("div").each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes("Тип телевизора")) {
                for (const type of types) {
                    if (text.includes(type)) {
                        tvType = type;
                        break;
                    }
                }
            }
        });

        return tvType || "Not Found";
    } catch (error) {
        console.error("Error fetching page:", error);
        return null;
    }
}

// **Self-Executing Function**
(async () => {
    await updateDailyTVProducts();
})();
