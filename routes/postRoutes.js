// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 게시글 생성
router.post('/', postController.createPost);

// 특정 게시판의 게시글 목록 조회
router.get('/', postController.getPosts);

// 특정 게시글 조회
router.get('/:id', postController.getPostById);

// 게시글 삭제
router.delete('/:id', postController.deletePost);

// 좋아요 토글
router.post('/:id/like', postController.toggleLike);

// 댓글 추가
router.post('/:id/comments', postController.addComment);

// 댓글 삭제
router.delete('/:id/comments/:commentId', postController.deleteComment);

module.exports = router;
