// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

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

module.exports = connectDb;
