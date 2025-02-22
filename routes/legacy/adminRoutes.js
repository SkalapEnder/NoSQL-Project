const mongoose = require("mongoose");
const express = require('express');
const User = require('../../models/User');
const Cart = require('../../models/Cart');
const Brand = require('../../models/Brand');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
require('dotenv').config();
const router = express.Router();
const adminCode = 'admin1243'

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Auth: Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

router.get("/users", async (req, res) => {
    if(req.session.userStatus === 'user'){
        return res.render("/");
    }

    try{
        const users = await User.find();
        if(!users) return res.render("templates/error", {errorMessage: "No users found"});
        res.render("admin/users_admin", { users: users });
    } catch(err) {
        return res.render("templates/error", {errorMessage: "Error getting users: " + err});
    }
});

router.put('/users/:id', async (req, res) => {
    const { username, email, role, secret_code } = req.body;

    if (role === 'admin' && secret_code !== adminCode) {
        return res.render('templates/error', {errorMessage: 'Secret code is required for admins'});
    }

    try {
        const updateData = {
            username: username,
            email: email,
            role: role };
        if (role === 'admin') {
            if (secret_code !== adminCode) {
                return res.render('templates/error', {errorMessage: 'Invalid secret code'});
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            {_id: req.params.id},
            {$set: updateData}
        );
        if (updatedUser === null) {
            return res.render('templates/error', {errorMessage: 'Error updating user'});
        }
        req.session.userStatus = role;
        req.session.username = username;
        res.redirect('/auth/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user.');
    }
});

router.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const response = await Cart.deleteMany({ user_id: userId });

        if (response === null) {
            return res.render('templates/error', {errorMessage: `Failed to delete Carts.`});
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (deletedUser === null) {
            return res.render('templates/error', {errorMessage: 'User not found or not deleted'});
        }

        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        return res.render('templates/error', {errorMessage: err});
    }
});

router.get("/products", async (req, res) => {
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

// Get all brands
router.get("/brands", async (req, res) => {
    if(req.session.userStatus === 'user'){
        return res.render("/");
    }

    try {
        const brands = await Brand.find();
        if (!brands) {
            return res.render("templates/error", { errorMessage: "No brands found" });
        }
        res.render("admin/brands_admin", { brands });
    } catch (err) {
        res.render("templates/error", { errorMessage: "Error getting brands: " + err });
    }
});

// Get all categories
router.get("/categories", async (req, res) => {
    if(req.session.userStatus === 'user'){
        return res.render("/");
    }

    try {
        const categories = await Category.find();
        if (!categories) {
            return res.render("templates/error", { errorMessage: "No categories found" });
        }
        res.render("admin/categories_admin", { categories });
    } catch (err) {
        res.render("templates/error", { errorMessage: "Error getting categories: " + err });
    }
});

module.exports = router;