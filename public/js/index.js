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

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);  // 실시간 날짜/시간 업데이트

    // 팝업 외부 클릭 시 닫기 이벤트 추가
    document.getElementById('popup').addEventListener('click', closePopupOnOutsideClick);
});

// 실시간 날짜/시간 업데이트
function updateDateTime() {
    const now = new Date();
    const options = { 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    };
    const datetimeString = now.toLocaleString('ko-KR', options);
    document.getElementById('datetime').textContent = datetimeString;
}

function openPopup(restaurantId) {
    currentRestaurantId = restaurantId;  // 현재 식당 ID 저장
    const popup = document.getElementById('popup');
    popup.style.display = 'flex';
    document.getElementById('popup-title').innerText = getRestaurantName(restaurantId);
    document.getElementById('popup-middel').innerText = getOperatingHours(restaurantId);

    // 시간대 생성 및 표시
    const timeSlotForm = document.getElementById('timeSlotForm');
    timeSlotForm.innerHTML = ''; // 이전 내용 초기화
    const timeSlots = getTimeSlots(restaurantId);

    // 각 시간대에 대한 투표 수를 서버에서 가져옵니다.
    fetch(`/api/surveys/${currentRestaurantId}`)
        .then(response => response.json())
        .then(data => {
            const dateStr = getTodayDateString();

            let row;
            timeSlots.forEach((slot, index) => {
                // 해당 시간대의 투표 수 가져오기
                let count = 0;
                if (
                    data[dateStr] &&
                    data[dateStr][slot]
                ) {
                    count = data[dateStr][slot];
                }

                if (index % 4 === 0) {
                    // 새로운 행 생성
                    row = document.createElement('div');
                    row.classList.add('button-row');
                    timeSlotForm.appendChild(row);
                }

                const button = document.createElement('button');
                button.classList.add('time-slot-button');
                button.innerText = `${slot} (${count}명)`;
                button.dataset.value = slot;

                // 클릭 시 선택 상태 유지
                button.addEventListener('click', function() {
                    // 이전에 선택된 버튼이 있으면 선택 해제
                    const previouslySelected = timeSlotForm.querySelector('.time-slot-button.selected');
                    if (previouslySelected && previouslySelected !== button) {
                        previouslySelected.classList.remove('selected');
                    }
                    // 클릭한 버튼에 'selected' 클래스 토글
                    button.classList.toggle('selected');
                });

                row.appendChild(button);
            });

            // 투표 인원수 업데이트
            updateVoteCount(data);
        })
        .catch(error => {
            console.error('데이터를 불러오는 중 오류 발생:', error);
        });
}

function submitResponse() {
    const selectedButton = document.querySelector('.time-slot-button.selected');
    if (!selectedButton) {
        alert('시간대를 선택해주세요.');
        return;
    }
    const timeSlot = selectedButton.dataset.value;
    const dateStr = getTodayDateString();

    // 서버에 투표 데이터 전송
    fetch('/api/surveys/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            restaurantId: currentRestaurantId,
            date: dateStr,
            timeSlot: timeSlot
        })
    })
    .then(response => response.json())
    .then(data => {
        // 투표 인원수 업데이트
        updateVoteCount(data);
        closePopup();
    })
    .catch(error => {
        console.error('투표 저장 중 오류 발생:', error);
    });
}

// 투표 인원수 업데이트 함수
function updateVoteCount(data) {
    const dateStr = getTodayDateString();

    let totalCount = 0;
    if (data[dateStr]) {
        const timeSlots = data[dateStr];
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

        let slotLabel = current.toTimeString().substr(0,5);

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

function getOperatingHours(restaurantId) {
    const operatingHours = {
        1: "운영시간 : 11:30 ~ 14:30",
        2: "운영시간 : 10:00 ~ 15:00",
        3: "운영시간 : 11:30 ~ 13:30",
        4: "운영시간 : 11:30 ~ 13:30"
    };

    return operatingHours[restaurantId] || "운영 시간 정보 없음";
}

// 팝업 닫기 함수
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// 팝업 외부 클릭 시 닫기
function closePopupOnOutsideClick(event) {
    const popupContent = document.querySelector('.popup-content');
    if (!popupContent.contains(event.target)) {
        closePopup();
    }
}

function goHome() {
    window.location.href = '/'; // 홈으로 이동
}

// 로그인 시 이용가능하도록 수정
function showBoard() {
    const isLoggedIn = getCookie('isLoggedIn');
    if (isLoggedIn !== 'true') {
        alert('로그인 후 이용할 수 있습니다.');
        window.location.href = '/login.html';
    } else {
        window.location.href = '/board.html';
    }
}

function showRating() {
    const isLoggedIn = getCookie('isLoggedIn');
    if (isLoggedIn !== 'true') {
        alert('로그인 후 이용할 수 있습니다.');
        window.location.href = '/login.html';
    } else {
        window.location.href = '/rating.html';
    }
}

function showLogin() {
    window.location.href = '/login'; // 로그인 페이지로 이동
}

function showSignup() {
    window.location.href = '/register'; // 회원가입 페이지로 이동
}

function goHome() {
    window.location.href = '/index.html';   // '/' 제거
}

function goToMyPage(){
    window.location.href = '/mypage.html';
}

// 쿠키에서 값을 가져오는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = getCookie('isLoggedIn');

    const authButtons = document.getElementById('auth-buttons');
    const userButtons = document.getElementById('user-buttons');

    // 요소가 존재하는지 확인
    if (!authButtons || !userButtons) {
        console.error('auth-buttons 또는 user-buttons 요소를 찾을 수 없습니다.');
        return;
    }

    if (isLoggedIn === 'true') {
        // 로그인 상태일 경우
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-buttons').style.display = 'block';
    } else {
        // 로그아웃 상태일 경우
        document.getElementById('auth-buttons').style.display = 'block';
        document.getElementById('user-buttons').style.display = 'none';
    }
});

// 로그아웃 함수
function logout() {
    // 쿠키 삭제
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'isLoggedIn=; Max-Age=0; path=/';
    // 로그아웃 메시지 표시
    alert("로그아웃 되었습니다!");

    location.reload();
}



//로컬스토리지 버전 
// let currentRestaurantId; // 현재 선택된 식당 ID


// const restaurantOperatingHours = {
//     1: { // 명진당
//         start: "11:30",
//         end: "14:30"
//     },
//     2: { // 학생회관
//         start: "10:00",
//         end: "15:00"
//     },
//     3: { // 교직원 식당
//         start: "11:30",
//         end: "13:30"
//     },
//     4: { // 복지동 식당
//         start: "11:30",
//         end: "13:30"
//     }
// };

// // 로컬 스토리지에서 데이터 로드
// function loadRestaurantData() {
//     const data = localStorage.getItem('restaurantData');
//     return data ? JSON.parse(data) : {};
// }

// // 로컬 스토리지에 데이터 저장
// function saveRestaurantData(data) {
//     localStorage.setItem('restaurantData', JSON.stringify(data));
// }

// // 페이지 로드 시 초기화
// document.addEventListener("DOMContentLoaded", function() {
//     updateDateTime();
//     setInterval(updateDateTime, 1000);  // 실시간 날짜/시간 업데이트
// });

// // 실시간 날짜/시간 업데이트
// function updateDateTime() {
//     const now = new Date();
//     const options = { 
//         month: 'long', 
//         day: 'numeric', 
//         weekday: 'long', 
//         hour: '2-digit', 
//         minute: '2-digit',
//         hour12: false 
//     };
//     const datetimeString = now.toLocaleString('ko-KR', options);
//     document.getElementById('datetime').textContent = datetimeString;
//     //이전 코드
//     // const now = new Date();
//     // const datetimeString = now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'short' });
//     // document.getElementById('datetime').textContent = datetimeString;
// }

// function openPopup(restaurantId) {
//     currentRestaurantId = restaurantId;  // 현재 식당 ID 저장
//     const popup = document.getElementById('popup');
//     popup.style.display = 'flex';
//     document.getElementById('popup-title').innerText = getRestaurantName(restaurantId);
//     document.getElementById('popup-middel').innerText = getOperatingHours(restaurantId);
//     // 투표 인원수 업데이트
//     updateVoteCount();

//     // 시간대 생성 및 표시
//     const timeSlotForm = document.getElementById('timeSlotForm');
//     timeSlotForm.innerHTML = ''; // 이전 내용 초기화
//     const timeSlots = getTimeSlots(restaurantId);
//     const data = loadRestaurantData();
//     const dateStr = getTodayDateString();

//     let row;
//     timeSlots.forEach((slot, index) => {
//         // 해당 시간대의 투표 수 가져오기
//         let count = 0;
//         if (
//             data[restaurantId] &&
//             data[restaurantId][dateStr] &&
//             data[restaurantId][dateStr][slot]
//         ) {
//             count = data[restaurantId][dateStr][slot];
//         }

//         if (index % 4 === 0) {
//             // 새로운 행 생성
//             row = document.createElement('div');
//             row.classList.add('button-row');
//             timeSlotForm.appendChild(row);
//         }

//         const button = document.createElement('button');
//         button.classList.add('time-slot-button');
//         button.innerText = `${slot} (${count}명)`;
//         button.dataset.value = slot;

//         // 클릭 시 선택 상태 유지
//         button.addEventListener('click', function() {
//             // 이전에 선택된 버튼이 있으면 선택 해제
//             const previouslySelected = timeSlotForm.querySelector('.time-slot-button.selected');
//             if (previouslySelected && previouslySelected !== button) {
//                 previouslySelected.classList.remove('selected');
//             }
//             // 클릭한 버튼에 'selected' 클래스 토글
//             button.classList.toggle('selected');
//         });

//         row.appendChild(button);
//     });
// }

// function submitResponse() {
//     const selectedButton = document.querySelector('.time-slot-button.selected');
//     if (!selectedButton) {
//         alert('시간대를 선택해주세요.');
//         return;
//     }
//     const timeSlot = selectedButton.dataset.value;

//     // 데이터 업데이트
//     const data = loadRestaurantData();
//     const dateStr = getTodayDateString();

//     if (!data[currentRestaurantId]) {
//         data[currentRestaurantId] = {};
//     }
//     if (!data[currentRestaurantId][dateStr]) {
//         data[currentRestaurantId][dateStr] = {};
//     }
//     if (!data[currentRestaurantId][dateStr][timeSlot]) {
//         data[currentRestaurantId][dateStr][timeSlot] = 0;
//     }

//     data[currentRestaurantId][dateStr][timeSlot] += 1;

//     saveRestaurantData(data);

//     // 투표 인원수 업데이트
//     updateVoteCount();

//     closePopup();
// }

// // 투표 인원수 업데이트 함수
// function updateVoteCount() {
//     const data = loadRestaurantData();
//     const dateStr = getTodayDateString();

//     let totalCount = 0;
//     if (data[currentRestaurantId] && data[currentRestaurantId][dateStr]) {
//         const timeSlots = data[currentRestaurantId][dateStr];
//         for (let slot in timeSlots) {
//             totalCount += timeSlots[slot];
//         }
//     }

//     document.getElementById('voteCount').innerText = `${getRestaurantName(currentRestaurantId)} 체크 인원: ${totalCount}명`;
// }

// // 현재 날짜 문자열 반환 함수
// function getTodayDateString() {
//     const now = new Date();
//     return now.toISOString().split('T')[0]; // YYYY-MM-DD 형식의 날짜 문자열
// }

// // 시간대 생성 함수
// function getTimeSlots(restaurantId) {
//     const operatingHours = restaurantOperatingHours[restaurantId];
//     const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
//     const [endHour, endMinute] = operatingHours.end.split(':').map(Number);

//     const start = new Date();
//     start.setHours(startHour, startMinute, 0, 0);

//     const end = new Date();
//     end.setHours(endHour, endMinute, 0, 0);

//     let slots = [];
//     let current = new Date(start);
//     while (current < end) {
//         let next = new Date(current);
//         next.setMinutes(current.getMinutes() + 15);

//         let slotLabel = current.toTimeString().substr(0,5);

//         slots.push(slotLabel);
//         current = next;
//     }
//     return slots;
// }

// // 식당 이름 반환 함수
// function getRestaurantName(restaurantId) {
//     const restaurantNames = {
//         1: '명진당',
//         2: '학생회관',
//         3: '교직원 식당',
//         4: '복지동 식당'
//     };
//     return restaurantNames[restaurantId] || `식당 ${restaurantId}`;
// }

// function getOperatingHours(restaurantId) {
//     const operatingHours = {
//         1: "운영시간 : 11:30 ~ 14:30",
//         2: "운영시간 : 10:00 ~ 15:00",
//         3: "운영시간 : 11:30 ~ 13:30",
//         4: "운영시간 : 11:30 ~ 13:30"
//     };

//     return operatingHours[restaurantId] || "운영 시간 정보 없음";
// }

// // 팝업 닫기 함수
// function closePopup() {
//     document.getElementById('popup').style.display = 'none';
// }

// // 팝업 외부 클릭 시 닫기
// function closePopupOnOutsideClick(event) {
//     const popup = document.getElementById('popup');
//     if (event.target === popup) {
//         closePopup();
//     }
// }

// function goHome() {
//     window.location.href = '/'; // 홈으로 이동
// }
// //로그인 시 이용가능하도록 수정
// function showBoard() {
//     const isLoggedIn = getCookie('isLoggedIn');
//     if (isLoggedIn !== 'true') {
//         alert('로그인 후 이용할 수 있습니다.');
//         window.location.href = '/login.html';
//     } else {
//         window.location.href = '/board.html';
//     }
// }
// function showRating() {
//     const isLoggedIn = getCookie('isLoggedIn');
//     if (isLoggedIn !== 'true') {
//         alert('로그인 후 이용할 수 있습니다.');
//         window.location.href = '/login.html';
//     } else {
//         window.location.href = '/rating.html';
//     }
// }

// function showLogin() {
//     window.location.href = '/login'; // 로그인 페이지로 이동
// }

// function showSignup() {
//     window.location.href = '/register'; // 회원가입 페이지로 이동
// }
// function goHome() {
//     window.location.href = '/index.html';   // '/' 제거
// }
// function goToMyPage(){
//     window.location.href = '/mypage.html';
// }
// //쿠키 구현
// // 쿠키에서 값을 가져오는 함수
// function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
// }

// // 페이지 로드 시 로그인 상태 확인
// document.addEventListener('DOMContentLoaded', function() {
//     const isLoggedIn = getCookie('isLoggedIn');

//     // 요소가 존재하는지 확인하기 위해 콘솔에 로그 출력
//     console.log('Checking login status...');
//     console.log('isLoggedIn:', isLoggedIn);

//     const authButtons = document.getElementById('auth-buttons');
//     const userButtons = document.getElementById('user-buttons');

//     // 요소가 존재하는지 확인
//     if (!authButtons || !userButtons) {
//         console.error('auth-buttons 또는 user-buttons 요소를 찾을 수 없습니다.');
//         return;
//     }

//     if (isLoggedIn === 'true') {
//         // 로그인 상태일 경우
//         document.getElementById('auth-buttons').style.display = 'none';
//         document.getElementById('user-buttons').style.display = 'block';
//     } else {
//         // 로그아웃 상태일 경우
//         document.getElementById('auth-buttons').style.display = 'block';
//         document.getElementById('user-buttons').style.display = 'none';
//     }
// });

// // 로그아웃 함수
// function logout() {
//     // 쿠키 삭제
//     document.cookie = 'token=; Max-Age=0; path=/';
//     document.cookie = 'isLoggedIn=; Max-Age=0; path=/';
//     // 페이지 새로고침

//     // 로그아웃 메시지 표시
//     alert("로그아웃 되었습니다!");
    
//     location.reload();
// }

