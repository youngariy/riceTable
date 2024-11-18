// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Express 앱 생성
const app = express();

// 데이터베이스 연결
const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB에 성공적으로 연결되었습니다: ${connect.connection.host}`);
    } catch (error) {
        console.error('MongoDB 연결 오류:', error);
        process.exit(1);
    }
};
connectDb();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'https://riceserver.onrender.com', // Netlify에서 배포된 URL
  }));
app.use(express.static(path.join(__dirname, 'public')));


// 라우트 불러오기
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

// 라우트 설정
app.use(userRoutes); // '/'삭제
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

// 메인 페이지 라우팅
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 게시판 페이지 라우팅
app.get('/board.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'board.html'));
});

// 루트 경로 요청 시 rice.html로 리디렉션
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 오류 발생:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://${getLocalIpAddress()}:${PORT}`);
});

function getLocalIpAddress() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '0.0.0.0';
}

//로그인 관련 함수
const User = require('./models/usersModel'); // User 모델 불러오기

async function initializeDatabase() {
    const users = await User.find();

    for (let user of users) {
        const updates = {};

        if (!user.studentId) {
            updates.studentId = Math.floor(10000000 + Math.random() * 90000000); // 8자리 랜덤 학번
        }
        if (!user.email) {
            updates.email = `${user.userid}@example.com`; // userid 기반 이메일 생성
        }

        if (Object.keys(updates).length > 0) {
            await User.updateOne({ _id: user._id }, { $set: updates });
            console.log(`사용자 업데이트 완료: ${user.userid}`);
        }
    }

    console.log('모든 사용자가 업데이트되었습니다.');
}

// 초기화 실행
initializeDatabase().catch((err) => console.error('데이터베이스 초기화 중 오류:', err));

// Survey 라우터 등록
const surveyRoutes = require('./routes/surveyRoutes');
app.use('/api/surveys', surveyRoutes);


