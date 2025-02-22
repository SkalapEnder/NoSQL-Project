const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require("method-override");
const passport = require('passport');
const connectDB = require("./scripts/db");

//const adminRouter = require("./routes/admin/adminRoutes");
const adminCategoryRouter = require("./routes/admin/adminCategoryRoutes");
const adminProductRouter = require("./routes/admin/adminProductRoutes");
const adminUserRouter = require("./routes/admin/adminUsersRoutes");
const adminBrandRouter = require("./routes/admin/adminBrandRoutes");
const mongoRoutes = require("./routes/admin/mongoRoutes");

const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/user/productRoutes');
const cartRouter = require('./routes/user/cartRoutes');
const brandRouter = require('./routes/user/brandRoutes');
const categoryRouter = require('./routes/user/categoryRoutes');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session middleware
app.use(session({
    secret: 'ff63d7fe7d4cb794a5b97a0708e560b9c015fb59a4a0e85dbf1d11a47f14ed32',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }
}));
app.use(methodOverride("_method"));
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.userStatus = req.session.userStatus || 'user';
    res.locals.username = req.session.username || 'Guest';
    res.locals.userId = req.session.userId || -1;
    next();
});
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.render('index'))

// Routes
app.use('/categories/admin', adminCategoryRouter);
app.use('/products/admin', adminProductRouter);
app.use('/brands/admin', adminBrandRouter);
app.use('/users/admin', adminUserRouter);
app.use("/mongo", mongoRoutes);

app.use('/auth', authRouter);
app.use('/cart', cartRouter);
app.use("/brands", brandRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);


connectDB().then(() => {
    app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
}).catch(err => process.exit(1));

function convertData(timestamp) {
    const date = new Date(Date.parse(timestamp));

    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();

    return `${time}, ${day} ${month}, ${year}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

app.locals.convertData = convertData;
app.locals.capitalizeFirstLetter = capitalizeFirstLetter;
