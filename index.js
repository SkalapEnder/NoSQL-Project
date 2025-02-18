const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRouter = require('./routes/authRoutes');
const taskRouter = require('./routes/taskRoutes');

const app = express();
const PORT = 3000;

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://skalap2endra:kGOM7z5V54vBFdp1@cluster0.vannl.mongodb.net/lab1_7?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log("Index: Connected to MongoDB Atlas"))
    .catch(err => console.log("Error during connect to MongoDB: ", err));

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

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.username = req.session.username || 'Guest';
    next();
});

app.get('/', (req, res) => res.render('index'))

// Routes
app.use('/', authRouter);
app.use('/', taskRouter);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

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
