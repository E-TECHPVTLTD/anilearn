const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://badal:badal12345@cluster0.9e54htc.mongodb.net/badal", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    feedback: { type: String, required: true }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Register route
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { name, feedback } = req.body;
        if (!name || !feedback) {
            return res.status(400).send('Username and feedback are required');
        }

        const newFeedback = new Feedback({ name, feedback });
        await newFeedback.save();
        res.status(201).send('Feedback received');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
