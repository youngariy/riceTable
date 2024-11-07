const mongoose = require('mongoose');

// MongoDB 연결 함수 설정
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/practice');
        console.log("MongoDB에 연결되었습니다.");
    } catch (error) {
        console.error("MongoDB 연결 오류:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
