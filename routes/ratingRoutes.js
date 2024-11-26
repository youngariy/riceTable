// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middlewares/authMiddleware'); // 인증 미들웨어

// 사용자가 오늘 평가를 작성했는지 확인하는 엔드포인트
router.get('/checkUserRatingToday', protect, ratingController.checkUserRatingToday);

// 게시글 생성 (로그인 필요)
router.post('/', protect, ratingController.createRating);

// 게시글 목록 조회
router.get('/', ratingController.getRatings);

// 평균 별점 조회 (새로운 엔드포인트 추가)
router.get('/average', ratingController.getAverageRating);

// 특정 게시글 조회
router.get('/:id', ratingController.getRatingById);

// 게시글 삭제 (로그인 및 작성자 권한 필요)
router.delete('/:id', protect, ratingController.deleteRating);

// 좋아요 추가
router.post('/:id/like', protect, ratingController.likeRating);

// 비추천 추가
router.post('/:id/dislike', protect, ratingController.dislikeRating);



module.exports = router;
