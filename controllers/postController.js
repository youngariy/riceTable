const Post = require('../models/postModel');

// 게시글 생성
exports.createPost = async (req, res) => {
    const { title, content, board } = req.body;

    try {
        const newPost = new Post({
            title,
            content,
            board,
            authorId: req.user._id, // 로그인된 사용자의 ID
            authorName: req.user.name // 로그인된 사용자의 이름
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('게시글 생성 오류:', error);
        res.status(500).json({ message: '게시글 생성 중 오류가 발생했습니다.' });
    }
};

// 게시글 목록 조회
exports.getPosts = async (req, res) => {
    const board = req.query.board;

    try {
        const posts = await Post.find({ board });
        res.json(posts);
    } catch (error) {
        console.error('게시글 목록 조회 오류:', error);
        res.status(500).json({ message: '게시글 목록 조회 중 오류가 발생했습니다.' });
    }
};

// 특정 게시글 조회
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        res.json(post);
    } catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).json({ message: '게시글 조회 중 오류가 발생했습니다.' });
    }
};

// 게시글 삭제
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 작성자만 삭제 가능
        if (post.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        await post.deleteOne();
        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.' });
    }
};

// 좋아요 추가/취소
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        post.likes += req.body.like ? 1 : -1;
        await post.save();

        res.json({ likes: post.likes });
    } catch (error) {
        console.error('좋아요 토글 오류:', error);
        res.status(500).json({ message: '좋아요 토글 중 오류가 발생했습니다.' });
    }
};

// 댓글 추가
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const { content } = req.body;
        const comment = {
            content,
            authorId: req.user._id, // 현재 로그인한 사용자 ID
            authorName: req.user.name, // 현재 로그인한 사용자 이름
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 추가 중 오류가 발생했습니다.' });
    }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const { commentId } = req.params;
        const commentIndex = post.comments.findIndex(
            (comment) => comment._id.toString() === commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 댓글 작성자만 삭제 가능
        if (post.comments[commentIndex].authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
    }
};
