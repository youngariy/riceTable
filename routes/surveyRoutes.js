// routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');

// 특정 식당의 투표 데이터 가져오기
router.get('/:restaurantId', surveyController.getSurveyData);

// 투표 데이터 저장하기
router.post('/vote', surveyController.vote);

module.exports = router;
