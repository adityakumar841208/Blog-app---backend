const express = require('express');
const User = require('./userModel');
const Blog = require('./blogModel');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

const corsOptions = {
  origin: 'https://reactblogapp123.netlify.app', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('hello aditya');
});

app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.send('Email and password are required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('User already exists');
        }

        const user = await User.create({ email, password });
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 3600000, sameSite: 'lax' });
        res.send('User signed up successfully');
    } catch (error) {
        console.error('Error detected in signin:', error);
        res.status(500).send('Internal server error',error);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Email and password are required');
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).send('User does not exist');
        }

        const isMatch =password === existingUser.password ;
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 3600000, sameSite: 'lax' });
        res.send('Successfully logged in');
    } catch (error) {
        console.error('Error detected in login:', error);
        res.status(500).send('Internal server error');
    }
});

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.send('Please login');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).send('Failed to authenticate token.');
        }

        // If everything is good, save the decoded token to request for use in other routes
        req.userId = decoded.userId;
        next();
    });
};

app.post('/createBlog', verifyToken, async (req, res) => {
    try {

        const { title, blog } = req.body;
        const id = req.userId

        if (!title || !blog) {
            return res.status(400).send('Title and blog content are required');
        }

        await Blog.create({ title, blog ,ownerId:id});
        res.status(201).send('Blog created successfully');
    } catch (error) {
        console.error('Error detected in createBlog:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/allBlogs', async (req, res) => {
  try {
    const allBlogs = await Blog.find().sort({ timestamp: -1 });
    res.json(allBlogs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/YourBlogs', verifyToken, async (req, res) => {
    try {
      const userId = req.userId;
      const yourBlogs = await Blog.find({ ownerId: userId });
      res.json(yourBlogs);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  

app.listen(PORT, () => {
    console.log(`Server is working on port ${PORT}`);
});
