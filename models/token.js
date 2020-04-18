const db = require('../db');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const tokenSchema = new Schema({
    mall_id: {
        type: String,
        trim: true,
        unique: true,
        index: true
    },
    access_token: {
        type: String,
        unique: true
    },
    expires_at: Date,
    refresh_token: String,
    refresh_token_expires_at: Date,
    client_id: String,
    user_id: String,
    scopes: Array,
    issued_at: Date
});
module.exports = mongoose.model('token', tokenSchema); 