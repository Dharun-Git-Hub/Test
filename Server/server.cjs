const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;


app.use(bodyParser.json());
const corsOptions = { origin: 'http://localhost:3001', 
                     methods: ['GET', 'POST', 'PUT', 'DELETE'],
                     };
app.use(cors(corsOptions));



mongoose.connect("mongodb+srv://22suca026:vDygSEKqfPeov26j@mycluster.5xout.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster").then(() => console.log('MongoDB connected')).catch(err => console.error(err));


const db = mongoose.connection.useDb('Project');
const MyData = db.collection('signedusers');


const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    loggedIn: { type: Boolean, default: false }, 
});

const User = mongoose.model('User', UserSchema);


const otpStore = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "ganeshgowri1985@gmail.com",
        pass: "ikmpxvyefgyweqdd", 
    },
});


app.post('/signup/send-otp', (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const otp = crypto.randomInt(100000, 999999); 
    otpStore.set(email, otp);

    const mailOptions = {
        from: "ganeshgowri1985@gmail.com",
        to: email,
        subject: 'MATE App OTP Code',
        text: `Your OTP code for Mate App is : ${otp} . Valid for only 5 Minutes`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error sending email.' });
        }

        res.json({ success: true, message: 'OTP sent successfully.' });
    });
});

app.post('/signup/verify-otp', async (req, res) => {
    const { username, password, email, otp } = req.body;

    // Validate OTP
    if (!otpStore.has(email) || otpStore.get(email) !== parseInt(otp)) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    try {
        // Check if username or email already exists
        const existingUser = await MyData.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Username already exists.' });
            }
            if (existingUser.email === email) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Email already in use.' });
            }
        }

        // Proceed with user creation
        const loggedIn = true;
        const newUser = { username, password, email, loggedIn };
        await MyData.insertOne(newUser);

        otpStore.delete(email); // Remove OTP after successful registration

        res.json({ success: true, message: 'User signed up successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error signing up user.' });
    }
});



app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await MyData.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Username or Password' });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid Username or Password' });
        }

        // Update the loggedIn status in the database
        await MyData.updateOne({ username }, { $set: { loggedIn: true } });

        res.status(200).json({ message: 'Login Successful', email: user.email });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/api/logout', async (req, res) => {
    const { username } = req.body;

    try {
        // Set the loggedIn field to false
        await MyData.updateOne({ username }, { $set: { loggedIn: false } });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/api/check-login', async (req, res) => {
    const { username } = req.body;

    try {
        const user = await MyData.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.loggedIn) {
            return res.status(200).json({ message: 'User is logged in' });
        }

        return res.status(200).json({ message: 'User is not logged in' });
    } catch (error) {
        console.error('Error checking login status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/check-username', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await MyData.findOne({ username });

        if (!user) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(409).json({ success: false, message: 'Username already found !' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/check-mail', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await MyData.findOne({ email });

        if (!user) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: 'Email already found !' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});



app.listen(PORT);
