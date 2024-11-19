const Survey = require('../models/Survey');
const UserVote = require('../models/UserVote');

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
    const userId = req.user._id; // 로그인된 사용자 ID

    try {
        // 같은 날짜에 다른 식당에 이미 투표했는지 확인
        const existingVote = await UserVote.findOne({ userId, date });
        if (existingVote) {
            return res.status(400).json({
                message: '같은 날짜에 하나의 식당에만 투표할 수 있습니다.'
            });
        }

        // 사용자 투표 기록 저장
        const userVote = new UserVote({ userId, restaurantId, date });
        await userVote.save();

        // Survey 컬렉션에 투표 데이터 업데이트
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

