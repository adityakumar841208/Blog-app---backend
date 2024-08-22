const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MODEL_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB of blogModel connection error:', err));


const blogSchema = new mongoose.Schema({
   title: { type: String, required: true },
   blog: { type: String, required: true },
   ownerId: { type: String, required: true },
   timestamp: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;