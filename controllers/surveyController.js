// controllers/surveyController.js
const Survey = require('../models/Survey');

// 특정 식당의 투표 데이터 가져오기
exports.getSurveyData = async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const surveys = await Survey.find({ restaurantId: Number(restaurantId) });

        // 데이터를 날짜별로 구조화
        const data = {};
        surveys.forEach(survey => {
            if (!data[survey.date]) {
                data[survey.date] = {};
            }
            data[survey.date][survey.timeSlot] = survey.count;
        });

        res.json(data);
    } catch (error) {
        console.error('투표 데이터 가져오기 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 투표 데이터 저장하기
exports.vote = async (req, res) => {
    const { restaurantId, date, timeSlot } = req.body;

    try {
        const survey = await Survey.findOneAndUpdate(
            { restaurantId, date, timeSlot },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        // 업데이트된 데이터를 반환
        const surveys = await Survey.find({ restaurantId });

        // 데이터를 날짜별로 구조화
        const data = {};
        surveys.forEach(survey => {
            if (!data[survey.date]) {
                data[survey.date] = {};
            }
            data[survey.date][survey.timeSlot] = survey.count;
        });

        res.json(data);
    } catch (error) {
        console.error('투표 저장 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};
