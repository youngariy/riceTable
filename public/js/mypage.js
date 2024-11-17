// mypage.js

document.addEventListener('DOMContentLoaded', loadUserProfile);

function loadUserProfile() {
    fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include', // 쿠키를 포함하여 요청
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('name').textContent = data.user.name;
            document.getElementById('studentId').textContent = data.user.studentId;
            document.getElementById('email').textContent = data.user.email;
            document.getElementById('userid').textContent = data.user.userid;
        } else {
            alert('사용자 정보를 불러올 수 없습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('오류가 발생했습니다. 다시 시도해 주세요.');
    });
}

function goHome() {
    window.location.href = '/index.html';
}

function logout() {
    fetch('/api/user/logout', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        alert('로그아웃되었습니다.');
        window.location.href = '/index.html';
    })
    .catch(error => {
        console.error('로그아웃 중 오류 발생:', error);
    });
}
