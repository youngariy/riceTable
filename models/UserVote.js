// models/UserVote.js
const mongoose = require('mongoose');

const userVoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantId: {
        type: Number,
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD 형식
        required: true
    }
});

userVoteSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UserVote', userVoteSchema);
