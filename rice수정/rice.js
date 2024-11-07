let oCounts = {};  // 각 식당별 O 체크 인원 수
let chart;
let currentRestaurantId; // 현재 선택된 식당 ID
let userVoted = false; // 사용자가 이미 투표했는지 여부

// 로컬 스토리지에서 데이터 불러오기
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('oCounts');
    if (savedData) {
        oCounts = JSON.parse(savedData);
    }
    userVoted = localStorage.getItem('userVoted') === 'true';
}

// 로컬 스토리지에 데이터 저장
function saveToLocalStorage() {
    localStorage.setItem('oCounts', JSON.stringify(oCounts));
    localStorage.setItem('userVoted', userVoted);
}

// 자정에 방문자 수 초기화하는 함수
function resetOCountAtMidnight() {
    const now = new Date();
    const millisUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
    setTimeout(() => {
        oCounts = {};  // 모든 식당의 카운트 초기화
        userVoted = false; // 사용자 투표 상태 초기화
        saveToLocalStorage();  // 초기화된 데이터 저장
        resetOCountAtMidnight();  // 다음 자정에도 실행되도록 재귀 호출
    }, millisUntilMidnight);
}

// 페이지가 로드될 때 초기화 설정
document.addEventListener("DOMContentLoaded", function() {
    loadFromLocalStorage();  // 저장된 데이터 불러오기
    resetOCountAtMidnight();
    updateDateTime();
    setInterval(updateDateTime, 1000);  // 실시간 날짜/시간 업데이트
});

// 실시간 날짜/시간 업데이트 함수
function updateDateTime() {
    const now = new Date();
    const datetimeString = now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'short' });
    document.getElementById('datetime').textContent = datetimeString;
}

function openPopup(restaurantId) {
    currentRestaurantId = restaurantId;
    const popup = document.getElementById('popup');
    popup.style.display = 'flex';
    document.getElementById('popup-title').innerText = `식당 ${restaurantId}`;
    if (!(restaurantId in oCounts)) {
        oCounts[restaurantId] = 0;  // 해당 식당의 카운트 초기화
        saveToLocalStorage();  // 변경사항 저장
    }
    updateGraph(restaurantId);  // 해당 식당의 그래프 업데이트
    
    // O 버튼 상태 업데이트
    const oButton = document.querySelector('#popup button[onclick="submitResponse(true)"]');
    oButton.disabled = userVoted;
    if (userVoted) {
        oButton.textContent = "이미 투표함";
    }
}

// O 체크 후 팝업 닫기 및 그래프 업데이트
function submitResponse(isO) {
    if (isO) {
        if (!userVoted) {
            oCounts[currentRestaurantId]++;
            userVoted = true;
            saveToLocalStorage();  // 변경사항 저장
            updateGraph(currentRestaurantId);
        } else {
            alert("중복 체크는 불가합니다!");
        }
    }
    closePopup();
}

// 그래프 업데이트 함수
function updateGraph(restaurantId) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    if (chart) {
        chart.destroy();  // 기존 차트를 제거하고 새로 그리기
    }

    const count = oCounts[restaurantId];
    const maxY = Math.max(10, Math.ceil(count * 1.2)); // 최소 10, 또는 현재 카운트의 120%

    chart = new Chart(ctx, {
        type: 'line',  // 선 그래프로 변경
        data: {
            labels: ['현재 인원'],
            datasets: [{
                label: 'O 체크 인원 수',
                data: [count],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxY,
                    ticks: {
                        stepSize: Math.max(1, Math.floor(maxY / 5))
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `O 체크 인원: ${tooltipItem.raw}명`;
                        }
                    }
                }
            }
        }
    });
}

// 팝업 닫기 함수
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
function goHome() {
    window.location.href = 'rice.html'; // 홈으로 이동
}
function isLoggedIn() {
    // 여기서는 간단히 localStorage를 사용해 로그인 상태를 확인합니다.
    // 실제 구현에서는 더 안전한 방법(예: 서버 세션 확인)을 사용해야 합니다.
    return localStorage.getItem('isLoggedIn') === 'true';
}

function showBoard() {
    if (isLoggedIn()) {
        window.location.href = 'index.html'; // 게시판으로 이동
    } else {
        alert('로그인 후 이용 가능합니다.');
        // 선택적으로 로그인 페이지로 리다이렉트할 수 있습니다.
        // window.location.href = 'login.html';
    }
}

function showRating() {
    if (isLoggedIn()) {
        window.location.href = '#2'; // 평가로 이동
    } else {
        alert('로그인 후 이용 가능합니다.');
        // 선택적으로 로그인 페이지로 리다이렉트할 수 있습니다.
        // window.location.href = 'login.html';
    }
}
function showLogin() {
    // 로그인 페이지나 모달을 표시하는 코드
    alert("로그인 기능은 아직 구현되지 않았습니다.");
}

function showSignup() {
    // 회원가입 페이지나 모달을 표시하는 코드
    alert("회원가입 기능은 아직 구현되지 않았습니다.");
}
