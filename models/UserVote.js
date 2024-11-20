// models/UserVote.js
//게시판에 이름 띄우기 위한 모델
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
