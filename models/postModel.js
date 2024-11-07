const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },        // 제목
  content: { type: String, required: true },      // 내용
  recommend: { type: String, default: false },   // 추천 여부 (true/false)
  rating: { type: Number, default: 0 },           // 평점
  board: { type: String, required: true },        // 게시판 이름 또는 ID
  comments: { type: [String], default: [] },      // 댓글 배열, 기본적으로 빈 배열로 초기화
  likes: { type: Number, default: 0 },            // 좋아요 수
  timestamp: { type: Date, default: Date.now }    // 생성 시간 (타임스탬프)
});
module.exports = mongoose.model('Post', postSchema);