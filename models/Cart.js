const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        products: [
            {
                product_id: { type: Number, required: true },
                name: { type: String, required: true },  // Store product name to avoid extra query
                price: { type: Number, required: true }, // Store price at the time of adding to cart
                picture: { type: String },               // Store first image of product
                quantity: { type: Number, default: 1, min: 1 },
                total: { type: Number, default: 0 }     // Store total for quick calculations
            }
        ],
        cart_total: { type: Number, default: 0 }
    },
    { timestamps: true }
);


cartSchema.pre("save", function (next) {
    this.products.forEach(product => {
        product.total = product.price * product.quantity;
    });

    this.cart_total = this.products.reduce((sum, p) => sum + p.total, 0);
    next();
});

const Task = mongoose.model('cart', cartSchema);
module.exports = Task;
