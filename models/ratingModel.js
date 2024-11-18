// models/ratingModel.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true }, // 별점은 숫자로 저장
  board: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  author: { type: String, required: true }, // 작성자 정보를 문자열로 저장
});

module.exports = mongoose.model('Rating', ratingSchema);
