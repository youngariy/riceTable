const asyncHandler = require("express-async-handler");
const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const validateInput = (name, studentId, email, userid, password) => {
  const errors = [];
  if (name && name.length < 2) {
    errors.push("이름은 최소 2자 이상이어야 합니다.");
  }
  if (!studentId || studentId.length < 8) {
    errors.push("학번은 최소 8자 이상이어야 합니다.");
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("유효한 이메일을 입력해 주세요.");
  }
  if (!userid || userid.length < 4) {
    errors.push("아이디는 최소 4자 이상이어야 합니다.");
  }
  
  if (!password || password.length < 6) {
    errors.push("비밀번호는 최소 6자 이상이어야 합니다.");
  }
  
 
  
  return errors;
};

const registerUser = asyncHandler(async (req, res) => {
  console.log("Request body:", req.body); // 요청 데이터 로그로 확인
  const { name, studentId, email, userid, password } = req.body;
  const validationErrors = validateInput(name, studentId, email, userid, password);

  if (!name || !studentId || !email || !userid || !password) {
    // 누락된 필드가 있는 경우 400 상태 코드와 함께 메시지를 반환
    return res.status(400).json({ message: "모든 필드를 입력해 주세요." });
}
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: validationErrors.join(", ")
    });
  }

  try {
    let user = await User.findOne({ $or: [{ userid }, { email }, { studentId }] });
    if (user) {
      return res.status(400).json({ message: "이미 등록된 아이디, 이메일 또는 학번입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      studentId,
      email,
      userid,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
    res.cookie("token", token, { httpOnly: true });
    res.cookie("isLoggedIn", "true", { httpOnly: false });
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.'
    });
  } catch (error) {
    // 중복 키 오류 처리
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0]; // 중복된 필드명 가져오기
      const errorMessage = `${duplicateKey} 필드가 이미 사용 중입니다. 다른 값을 입력해 주세요.`;
      return res.status(400).json({ success: false, message: errorMessage });
  }
    console.error("Server Error:", error); // 구체적인 서버 오류 출력
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});




const loginUser = asyncHandler(async (req, res) => {
    const {userid, password} = req.body;
    try{

      const user = await User.findOne({ userid });
      if(!user) {
        return res.status(401).json({message: "일치하는 사용자가 없습니다."});
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch) {
        return res.status(401).json({
          success: false,
          message: "비밀번호가 일치하지 않습니다."
        });
      }
      const token = jwt.sign({id: user._id}, jwtSecret);
      res.cookie("token", token, {httpOnly: true});
      res.cookie("isLoggedIn", "true", { httpOnly: false }); // 로그인 상태 쿠키 설정
      res.json({
        success: true,
        message: '로그인이 완료되었습니다.',
        user: {
          id: user._id,
          name: user.name,
          userid: user.userid
        }
      });
   
    } catch(error) {
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    });
    const logoutUser = asyncHandler(async (req, res) => {
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
      });res.cookie('isLoggedIn', '', {
        expires: new Date(0)
      }); // 로그인 상태 쿠키 삭제
      
      res.json({
        success: true,
        message: '로그아웃되었습니다.'
      });
    });
    
//사용자 정보 가져오기
const getUserProfile = asyncHandler(async (req, res) => {
    try {
      const token = req.cookies.token;
          if (!token) {
              return res.status(401).json({ message: "로그인이 필요합니다." });
          }
  
          const decoded = jwt.verify(token, jwtSecret);
          const user = await User.findById(decoded.id).select("-password"); // 비밀번호는 제외하고 조회
  
          if (!user) {
              return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
          }
  
          res.status(200).json({
              success: true,
              user: {
                name: user.name,
                studentId: user.studentId, // 학번 추가
                email: user.email,         // 이메일 추가
                userid: user.userid,
              }
          });
      } catch (error) {
          res.status(500).json({
              success: false,
              message: "서버 오류가 발생했습니다.",
          });
      }
  });
    module.exports = {registerUser, loginUser, logoutUser, getUserProfile};