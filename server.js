const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors'); //cors 모듈 불러오기
const PORT = process.env.PORT || 3000;
const dbConnect = require('./config/dbConnect');
const postRoutes = require('./routes/postRoutes');

// MongoDB 연결
require('dotenv').config();
dbConnect();

// JSON 요청을 파싱하도록 설정
app.use(express.json());

// 라우트 설정
app.use('/api/posts', postRoutes);

// 정적 파일(CSS, JS) 서빙
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// 메인 페이지 라우팅
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rice.html'));
});

// 게시판 페이지 라우팅
app.get('/board.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'board.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});


app.use(cors());

// 기존 라우트 설정 이후에 위치
app.use((err, req, res, next) => {
    console.error("서버 오류 발생:", err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});