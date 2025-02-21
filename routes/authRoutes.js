const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Cart = require('../models/Cart');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require("mongoose");
require('dotenv').config();
const router = express.Router();
const adminCode = 'admin1243'

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });
        if (user === null) return done(null, false, { message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Invalid email or password' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.user_id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findOne({_id: id});
        done(null, user);
    } catch (err) {
        done(err);
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Auth: Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

// REGISTER
router.get('/register', (req, res) => res.render('auth/registration', {role: 'user'}));

router.post('/register',[
 body('email').isEmail().withMessage('Invalid email address'),
 body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain a special character')],
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errorMessage: errors.array()[0]['msg'] });
    }
    const { username, email, password, role, secretCode } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser !== null) {
        return res.status(400).json({ errorMessage: 'User with it email already exists' });
    }

    if (role === 'admin' && secretCode !== adminCode) {
        return res.status(400).json({ errorMessage: 'Invalid secret code' });
    }

    const newUser = new User({
        username: username,
        email: email,
        password: password,
        role: role,
        created_at: new Date(),
        updated_at: new Date(),
    });

    await newUser.save();
    res.redirect('/login');
});

// LOGIN
router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (user === null) {
        return res.status(400).json({errorMessage: 'User not found'});
    }
    if (!(await bcrypt.compare(password, user.password))){
        return res.status(400).json({errorMessage: 'Invalid password'});
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isLoggedIn = true;
    res.redirect('todo');
});

// UPDATE part
router.get('/update', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (user === null) {
        return res.render('templates/error', {errorMessage: 'User not found'});
    }
    res.render('profile/update', {user});
})

router.post('/update',  isAuthenticated, async (req, res) => {
    const { username, email, role, secret_code } = req.body;

    if (role === 'admin' && secret_code === null) {
        return res.render('error', {errorMessage: 'Secret code is required for admins'});
    }

    try {
        const updateData = {
            username: username,
            email: email,
            role: role };
        if (role === 'admin') {
            if (secret_code !== adminCode) {
                return res.render('error', {errorMessage: 'Invalid secret code'});
            }
        }

        const user_id = req.session.userId;
        const updatedUser = await User.findOneAndUpdate(
            {_id: user_id},
            {$set: updateData}
        );
        if (updatedUser === null) {
            return res.render('error', {errorMessage: 'Error updating user'});
        }
        req.session.username = username;
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user.');
    }
});

// LOG OUT part
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.render('templates/error', {errorMessage: 'Error logging out'});
        }
        res.redirect('/');
    });
});

router.post('/delete-account',  isAuthenticated, async (req, res) => {
    const userId = req.session.userId;

    try {
        const response = await Cart.deleteMany({ user_id: userId });

        if (response === null) {
            console.error(`Failed to delete Carts.`);
        }

        const deletedUser = await User.findOneAndDelete({ user_id: userId });
        if (deletedUser === null) {
            return res.render('error', {errorMessage: 'User not found or not deleted'});
        }

        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        return res.render('error', {errorMessage: err});
    }
});

router.get('/profile', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (user === null) {
        return res.render('templates/error', {errorMessage: 'User not found'});
    }
    return res.render('profile/profile', {user});
})

module.exports = router;
