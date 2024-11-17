const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const cookieParser = require("cookie-parser");
const checkLogin = require("../middlewares/checkLogin");
const {registerUser, loginUser, logoutUser, getUserProfile} = require("../controllers/userController");
const path = require("path");
router.use(cookieParser());

// 정적 파일 경로 수정
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/regi.html"));
});

router.get("/", checkLogin, (req, res) => {
    res.send("Home page 로그인 확인");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUserProfile); // 마이페이지 경로 추가
module.exports = router;