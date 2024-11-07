let currentRestaurantId; // 현재 선택된 식당 ID

const restaurantOperatingHours = {
    1: { // 명진당
        start: "11:30",
        end: "14:30"
    },
    2: { // 학생회관
        start: "10:00",
        end: "15:00"
    },
    3: { // 교직원 식당
        start: "11:30",
        end: "13:30"
    },
    4: { // 복지동 식당
        start: "11:30",
        end: "13:30"
    }
};

// 로컬 스토리지에서 데이터 로드
function loadRestaurantData() {
    const data = localStorage.getItem('restaurantData');
    return data ? JSON.parse(data) : {};
}

// 로컬 스토리지에 데이터 저장
function saveRestaurantData(data) {
    localStorage.setItem('restaurantData', JSON.stringify(data));
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);  // 실시간 날짜/시간 업데이트
});

// 실시간 날짜/시간 업데이트
function updateDateTime() {
    const now = new Date();
    const datetimeString = now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'short' });
    document.getElementById('datetime').textContent = datetimeString;
}

function openPopup(restaurantId) {
    currentRestaurantId = restaurantId;  // 현재 식당 ID 저장
    const popup = document.getElementById('popup');
    popup.style.display = 'flex';
    document.getElementById('popup-title').innerText = getRestaurantName(restaurantId);

    // 투표 인원수 업데이트
    updateVoteCount();

    // 시간대 생성 및 표시
    const timeSlotForm = document.getElementById('timeSlotForm');
    timeSlotForm.innerHTML = ''; // 이전 내용 초기화
    const timeSlots = getTimeSlots(restaurantId);
    const data = loadRestaurantData();
    const dateStr = getTodayDateString();

    timeSlots.forEach((slot, index) => {
        // 해당 시간대의 투표 수 가져오기
        let count = 0;
        if (
            data[restaurantId] &&
            data[restaurantId][dateStr] &&
            data[restaurantId][dateStr][slot]
        ) {
            count = data[restaurantId][dateStr][slot];
        }

        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="timeSlot" value="${slot}"> ${slot} (${count}명)`;
        timeSlotForm.appendChild(label);
        timeSlotForm.appendChild(document.createElement('br'));
    });
}

// 투표 제출 함수
function submitResponse() {
    const selectedTimeSlot = document.querySelector('input[name="timeSlot"]:checked');
    if (!selectedTimeSlot) {
        alert('시간대를 선택해주세요.');
        return;
    }
    const timeSlot = selectedTimeSlot.value;

    // 데이터 업데이트
    const data = loadRestaurantData();
    const dateStr = getTodayDateString();

    if (!data[currentRestaurantId]) {
        data[currentRestaurantId] = {};
    }
    if (!data[currentRestaurantId][dateStr]) {
        data[currentRestaurantId][dateStr] = {};
    }
    if (!data[currentRestaurantId][dateStr][timeSlot]) {
        data[currentRestaurantId][dateStr][timeSlot] = 0;
    }

    data[currentRestaurantId][dateStr][timeSlot] += 1;

    saveRestaurantData(data);

    // 투표 인원수 업데이트
    updateVoteCount();

    closePopup();
}

// 투표 인원수 업데이트 함수
function updateVoteCount() {
    const data = loadRestaurantData();
    const dateStr = getTodayDateString();

    let totalCount = 0;
    if (data[currentRestaurantId] && data[currentRestaurantId][dateStr]) {
        const timeSlots = data[currentRestaurantId][dateStr];
        for (let slot in timeSlots) {
            totalCount += timeSlots[slot];
        }
    }

    document.getElementById('voteCount').innerText = `${getRestaurantName(currentRestaurantId)} 체크 인원: ${totalCount}명`;
}

// 현재 날짜 문자열 반환 함수
function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD 형식의 날짜 문자열
}

// 시간대 생성 함수
function getTimeSlots(restaurantId) {
    const operatingHours = restaurantOperatingHours[restaurantId];
    const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
    const [endHour, endMinute] = operatingHours.end.split(':').map(Number);

    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    let slots = [];
    let current = new Date(start);
    while (current < end) {
        let next = new Date(current);
        next.setMinutes(current.getMinutes() + 15);

        let slotLabel = current.toTimeString().substr(0,5) + " - " + next.toTimeString().substr(0,5);
        slots.push(slotLabel);
        current = next;
    }
    return slots;
}

// 식당 이름 반환 함수
function getRestaurantName(restaurantId) {
    const restaurantNames = {
        1: '명진당',
        2: '학생회관',
        3: '교직원 식당',
        4: '복지동 식당'
    };
    return restaurantNames[restaurantId] || `식당 ${restaurantId}`;
}

// 팝업 닫기 함수
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// 팝업 외부 클릭 시 닫기
function closePopupOnOutsideClick(event) {
    const popup = document.getElementById('popup');
    if (event.target === popup) {
        closePopup();
    }
}

function goHome() {
    window.location.href = '/'; // 홈으로 이동
}
function showBoard() {
    window.location.href = '/board.html'; // 게시판으로 이동
}
function showRating() {
    window.location.href = '#2'; // 평가로 이동
}

// 로그인이 구현되면 사용
// function showBoard() {
//     if (isLoggedIn()) {
//         window.location.href = 'index.html'; // 게시판으로 이동
//     } else {
//         alert('로그인 후 이용 가능합니다.');
//         // 선택적으로 로그인 페이지로 리다이렉트할 수 있습니다.
//         // window.location.href = 'login.html';
//     }
// }

// function showRating() {
//     if (isLoggedIn()) {
//         window.location.href = '#2'; // 평가로 이동
//     } else {
//         alert('로그인 후 이용 가능합니다.');
//         // 선택적으로 로그인 페이지로 리다이렉트할 수 있습니다.
//         // window.location.href = 'login.html';
//     }
// }

function showLogin() {
    // 로그인 페이지나 모달을 표시하는 코드
    alert("로그인 기능은 아직 구현되지 않았습니다.");
}

function showSignup() {
    // 회원가입 페이지나 모달을 표시하는 코드
    alert("회원가입 기능은 아직 구현되지 않았습니다.");
}