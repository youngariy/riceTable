//게시글 모델

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    board: { type: Number, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [commentSchema], // 댓글 스키마 추가
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
