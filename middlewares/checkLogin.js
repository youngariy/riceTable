const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const checkLogin = async(req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.redirect("/");//토큰이 없을 경우 로그인 페이지로 이동
    }
    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.username = decoded.username;
        next();
    } catch(error){
        return res.status(401).json({message: "로그인이 필요합니다."});
    }
};
module.exports = checkLogin;