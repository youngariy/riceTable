// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const Rating = require('../models/ratingModel');
const asyncHandler = require('express-async-handler');

// 게시글 목록 불러오기
router.get('/', asyncHandler(async (req, res) => {
  const board = req.query.board; // 쿼리 파라미터에서 board 값 가져오기
  const ratings = await Rating.find({ board });
  res.json(ratings);
}));

// 게시글 생성
router.post('/', asyncHandler(async (req, res) => {
  const { title, content, rating, board, author } = req.body;
  const newRating = new Rating({
    title,
    content,
    rating,
    board,
    author, // 작성자 정보는 클라이언트에서 전달받음
  });
  const savedRating = await newRating.save();
  res.status(201).json(savedRating);
}));

// 게시글 수정
router.put('/:id', asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  // 권한 확인 없이 수정 (주의 필요)
  rating.title = req.body.title || rating.title;
  rating.content = req.body.content || rating.content;
  rating.rating = req.body.rating || rating.rating;
  await rating.save();
  res.json(rating);
}));

// 게시글 삭제
router.delete('/:id', asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  // 권한 확인 없이 삭제 (주의 필요)
  await rating.remove();
  res.json({ message: '게시글이 삭제되었습니다.' });
}));

// 좋아요 추가
router.post('/:id/like', asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  rating.likes += 1;
  await rating.save();
  res.json({ message: '추천되었습니다.', likes: rating.likes });
}));

// 비추천 추가
router.post('/:id/dislike', asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  rating.dislikes += 1;
  await rating.save();
  res.json({ message: '비추천되었습니다.', dislikes: rating.dislikes });
}));

module.exports = router;
