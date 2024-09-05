const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Anilearn', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas and Models
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
    email: String
}));

const Feedback = mongoose.model('Feedback', new mongoose.Schema({
    name: String,
    feedback: String
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    try {
        await user.save();
        res.redirect('/login.html');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.redirect('/index.html');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/feedback', async (req, res) => {
    const { name, feedback } = req.body;
    const feedbackEntry = new Feedback({ name, feedback });
    try {
        await feedbackEntry.save();
        res.redirect('/feedback.html');
    } catch (err) {
        res.status(500).send('Error submitting feedback');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
