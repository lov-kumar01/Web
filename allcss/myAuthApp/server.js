
import'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from'body-parser';
import bcrypt from 'bcryptjs';
import jwt from'jsonwebtoken';
import authMiddleware from './authMiddleware.js'; // Import the authentication middleware
import User from './user.js'; // Import the User model
import cookieParser from 'cookie-parser';


const app = express();
const PORT = 3000;
const SECRET_KEY = "secret";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/authDB', { useNewUrlParser: true,  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome' });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ msg: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please provide both username and password' });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        console.log("Token generated:", token);

        // Store the token in a cookie (with httpOnly and maxAge for security)
        res.cookie('access_token', token, {
            httpOnly: true,  // Cannot be accessed via JavaScript
            maxAge: 3 * 60 * 60 * 1000, // Token expires in 3 hours
            secure: process.env.NODE_ENV === 'production', // Only use 'secure' flag in production (HTTPS)
            sameSite: 'Strict' // Helps prevent CSRF attacks
        });
        // Redirect the user to the profile page
        return res.status(200).json(token);
    } catch (err) {
        // Handle server errorsc
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Protected Route for User Profile
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        console.log("verified>>>", req.user); // This will log the user object from JWT
        const user = await User.findById(req.user.userId); // Assuming the userId is valid

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log("user>>", user); // This will log the user data retrieved from the DB

     res.render("profile", {user: user.username});
    // return res.status(200).json(token);

    } catch (err) {
        // Handle unexpected errors and return a 500 status
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
