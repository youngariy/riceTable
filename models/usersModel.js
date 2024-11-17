const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {  //이름
        type: String,
        required: true,
    },
    studentId: { //학번
        type: Number,
        required: true,
        unique: true, // 학번의 중복을 방지
    },
    email: { //이메일
        type: String,
        required: true,
        unique: true, // 이메일 중복 방지
    },
    userid: { //아이디
        type: String,
        required: true,
        unique: true, // 아이디 중복 방지
    },
    password: { //비밀번호
        type: String, 
        required: true,
    },
});

module.exports = mongoose.model("User", UserSchema);