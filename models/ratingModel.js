//평가페이지 모델
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true },
    board: { type: Number, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
