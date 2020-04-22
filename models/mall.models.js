const db = require('../db');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const mallSchema = new Schema({
    mall_id: {
        type: String,
        trim: true,
        unique: true,
        index: true
    },
    country_code: String,
    status: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
});
module.exports = mongoose.model('Mall', mallSchema); 