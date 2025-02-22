const express = require("express");
const router = express.Router();
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// 🛒 Add product to cart
// Add product to cart
router.post("/add", async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.session.userId;

        // Fetch product details
        const product = await Product.findOne({ product_id: parseInt(product_id) });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Find user's cart
        let cart = await Cart.findOne({ user_id });

        if (!cart) {
            // Create new cart if not exists
            cart = new Cart({
                user_id,
                products: [
                    {
                        product_id: product.product_id,
                        name: product.name,
                        price: product.price,
                        picture: product.pictures[0] || "",
                        quantity: quantity || 1,
                        total: product.price * (quantity || 1)
                    }
                ]
            });
        } else {
            // Check if product already in cart
            const existingProduct = cart.products.find(p => p.product_id.equals(parseInt(product.product_id)));

            if (existingProduct) {
                existingProduct.quantity += quantity || 1;
                existingProduct.total = existingProduct.quantity * product.price;
            } else {
                cart.products.push({
                    product_id: parseInt(product.product_id),
                    name: product.name,
                    price: product.price,
                    picture: product.pictures[0] || "",
                    quantity: quantity || 1,
                    total: product.price * (quantity || 1)
                });
            }
        }

        // Recalculate cart total
        cart.cart_total = cart.products.reduce((sum, p) => sum + p.total, 0);

        // Save changes
        await cart.save();

        res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ error: "Failed to add product to cart" + error });
    }
});

// ❌ Remove product from cart
router.post("/remove", async (req, res) => {
    try {
        const { product_id } = req.body;
        const user_id = req.session.userId;
        if (!user_id || !product_id) return res.status(400).json({ error: "User ID and Product ID required" });

        let cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.products = cart.products.filter(p => p.product_id !== product_id);
        await cart.save();

        res.json({ message: "Product removed from cart", cart });
    } catch (err) {
        console.error("Error removing product from cart:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Perform purchase (Clears cart)
router.post("/purchase", async (req, res) => {
    try {
        const user_id = req.session.userId;
        if (!user_id) return res.status(400).json({ error: "User ID required" });

        const cart = await Cart.findOne({ user_id });
        if (!cart || cart.products.length === 0) return res.status(400).json({ error: "Cart is empty" });

        await Cart.updateOne({ user_id }, {$set: {products: [], cart_total: 0}});
        res.json({ message: "Purchase successful!" });
    } catch (err) {
        console.error("Error processing purchase:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🛍️ Get cart details
router.get("/", async (req, res) => {
    try {
        const userId = parseInt(req.session.userId);
        if (!userId) {
            return res.redirect("/auth/login");
        }

        const cart = await Cart.findOne({ user_id: userId });

        if (!cart) {
            return res.render("cart", { cart: { products: [] } });
        }

        res.render("cart", { cart });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Failed to fetch cart" + error });
    }
});
module.exports = router;
