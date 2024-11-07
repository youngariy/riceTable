const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const connectDB = require('./db'); // db.js 파일 불러오기
const mongoose = require('mongoose');

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

// // JSON 파싱을 위한 미들웨어
// app.use(express.json());


// MongoDB에 연결
mongoose.connect('mongodb://localhost:27017/practice');

const db = mongoose.connection;
db.on('error', console.error.bind(console, '연결 오류:'));
db.once('open', () => {
  console.log('MongoDB에 연결되었습니다');
});



// // MongoDB에 연결
// mongoose.connect('mongodb://localhost:27017/practice')
//   .then(() => console.log('MongoDB에 연결되었습니다'))
//   .catch((err) => console.error('MongoDB 연결 오류:', err));

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, '연결 오류:'));
// db.once('open', () => {
//   console.log('MongoDB에 연결되었습니다');
// });

// // 새로운 사용자 생성
// app.post('/users', async (req, res) => {
//     try {
//       const user = new User(req.body);
//       await user.save();
//       res.send(user);
//     } catch (err) {
//       res.status(400).send(err);
//     }
//   });
  
//   // 모든 사용자 조회
//   app.get('/users', async (req, res) => {
//     try {
//       const users = await User.find();
//       res.send(users);
//     } catch (err) {
//       res.status(500).send(err);
//     }
//   });
  