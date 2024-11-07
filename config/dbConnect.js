const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = async () => {
  try{
    const content = await mongoose.connect(process.env.DB_CONNECT);
    console.log('MongoDB에 연결되었습니다!!!!');
  } catch (err){
    console.log('MongoDB 연결 오류:', err);
  }
};

module.exports = dbConnect;