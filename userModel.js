const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.USER_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB of userModel connected...'))
    .catch(err => console.error('MongoDB connection error:', err));


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
