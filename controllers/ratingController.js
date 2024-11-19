// controllers/ratingController.js
const Rating = require('../models/ratingModel');
const UserVote = require('../models/UserVote'); // 필요한 경우 투표 제한을 위해 사용

// 게시글 생성
exports.createRating = async (req, res) => {
    const { title, content, rating, board } = req.body;

    try {
        const newRating = new Rating({
            title,
            content,
            rating,
            board,
            authorId: req.user._id,       // 로그인된 사용자의 ID
            authorName: req.user.name      // 로그인된 사용자의 이름
        });

        const savedRating = await newRating.save();
        res.status(201).json(savedRating);
    } catch (error) {
        console.error('평가 생성 오류:', error);
        res.status(500).json({ message: '평가 생성 중 오류가 발생했습니다.' });
    }
};

// 평가 목록 조회
exports.getRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ board: req.query.board })
            .populate('authorId', 'name'); // authorId를 populate하여 name을 포함

        // 각 게시글에 authorName 추가
        const ratingsWithAuthor = ratings.map(rating => ({
            ...rating._doc,
            authorName: rating.authorId.name
        }));

        res.json(ratingsWithAuthor);
    } catch (error) {
        console.error('평가 목록 조회 오류:', error);
        res.status(500).json({ message: '평가 목록을 조회하는 중 오류가 발생했습니다.' });
    }
};
// 특정 평가 조회
exports.getRatingById = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: '평가를 찾을 수 없습니다.' });
        }
        res.json(rating);
    } catch (error) {
        console.error('평가 조회 오류:', error);
        res.status(500).json({ message: '평가 조회 중 오류가 발생했습니다.' });
    }
};

// 평가 삭제
exports.deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: '평가를 찾을 수 없습니다.' });
        }

        // 작성자만 삭제 가능
        if (rating.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        await rating.deleteOne();
        res.json({ message: '평가가 삭제되었습니다.' });
    } catch (error) {
        console.error('평가 삭제 오류:', error);
        res.status(500).json({ message: '평가 삭제 중 오류가 발생했습니다.' });
    }
};

// 좋아요 추가
exports.likeRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: '평가를 찾을 수 없습니다.' });
        }

        rating.likes += 1;
        await rating.save();

        res.json({ likes: rating.likes });
    } catch (error) {
        console.error('좋아요 추가 오류:', error);
        res.status(500).json({ message: '좋아요 추가 중 오류가 발생했습니다.' });
    }
};

// 비추천 추가
exports.dislikeRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: '평가를 찾을 수 없습니다.' });
        }

        rating.dislikes += 1;
        await rating.save();

        res.json({ dislikes: rating.dislikes });
    } catch (error) {
        console.error('비추천 추가 오류:', error);
        res.status(500).json({ message: '비추천 추가 중 오류가 발생했습니다.' });
    }
};
