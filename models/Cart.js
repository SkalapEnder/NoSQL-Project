const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: { type: Number, default: -1 },
    products: [{ type: Number, default: -1 }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});


cartSchema.pre('save', async function (next) {
    next();
});

const Task = mongoose.model('cart', cartSchema);
module.exports = Task;
