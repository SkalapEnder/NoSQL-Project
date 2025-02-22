const express = require('express');
const User = require('../../models/User');
const Cart = require('../../models/Cart');
const router = express.Router();
const adminCode = 'admin1243'

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
    try {
        const { username, email, password, role, secretCode } = req.body;

        if (!req.session.userStatus || req.session.userStatus !== "admin") {
            return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
        }

        if (!username || !email || !password || !role) {
            return res.render("templates/error", {errorMessage: "All fields are required" });
        }

        const newUser = new User({
            username,
            email,
            password,
            role,
            secretCode,
        });

        await newUser.save();
        res.redirect("/users/admin");

    } catch (err) {
        console.error("Error creating user:", err);
        res.render("templates/error", {errorMessage: "Server error: " + err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { username, email, role, secretCode } = req.body;

    if (!req.session.userStatus || req.session.userStatus !== "admin") {
        return res.render("templates/error", {errorMessage: "Unauthorized. Please, login to admin" });
    }

    if (role === 'admin' && secretCode !== adminCode) {
        return res.status(400).json({ errorMessage:'Invalid code'});
    }

    try {
        const updateData = {
            username: username,
            email: email,
            role: role,
            updatedAt: new Date(),};

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData);
        if (updatedUser === null) {
            return res.status(401).json({ errorMessage: 'Error updating user'});
        }

        req.session.userStatus = role;
        req.session.username = username;
        res.status(200).json({ errorMessage: 'Successfully update user!'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ errorMessage:'Error updating user.'});
    }
});

router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    if (!req.session.userStatus || req.session.userStatus !== "admin") {
        return res.status(401).json({errorMessage: "Unauthorized. Please, login to admin" });
    }

    try {
        const response = await Cart.deleteMany({ user_id: userId });

        if (!response.acknowledged) {
            return res.status(402).json({ errorMessage: 'Cannot delete cart'});
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (deletedUser === null) {
            return res.status(403).json({errorMessage: 'User not found or not deleted'});
        }

        res.status(200).json({ message: 'Successfully deleted' });
    } catch (err) {
        return res.status(500).json({errorMessage: err});
    }
});

module.exports = router;