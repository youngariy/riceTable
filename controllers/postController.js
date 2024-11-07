// controllers/postController.js
const Post = require('../models/postModel');

// 게시글 생성
exports.createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 게시글 목록 조회 (게시판 번호별로)
exports.getPosts = async (req, res) => {
    try {
        const { board } = req.query;
        const posts = await Post.find({ board: board });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 특정 게시글 조회
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) res.status(200).json(post);
        else res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 게시글 삭제
exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (deletedPost) res.status(200).json({ message: '게시글이 삭제되었습니다.' });
        else res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 좋아요 추가/취소
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            const { like } = req.body;
            post.likes += like ? 1 : -1;
            await post.save();
            res.status(200).json(post);
        } else {
            res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 댓글 추가
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            const { comment } = req.body;
            post.comments.push(comment);
            await post.save();
            res.status(200).json(post);
        } else {
            res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
    try {
        const { commentIndex } = req.body;
        const post = await Post.findById(req.params.id);
        if (post) {
            if (post.comments && post.comments.length > commentIndex) {
                post.comments.splice(commentIndex, 1);
                await post.save();
                res.status(200).json(post);
            } else {
                res.status(400).json({ error: '유효하지 않은 댓글 인덱스입니다.' });
            }
        } else {
            res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.createPost = async (req, res) => {
   try {
       const newPost = new Post(req.body);
       const savedPost = await newPost.save();
       res.status(201).json(savedPost);
   } catch (err) {
       console.error("게시글 생성 중 오류 발생:", err); // 전체 오류 객체를 출력
       res.status(500).json({ error: err.message });
   }
};
