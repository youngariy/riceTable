let currentBoard = 1;
const postList = document.getElementById('postList');
const postModal = document.getElementById('postModal');
const contentModal = document.getElementById('contentModal');
const postContentDiv = document.getElementById('postContent');
const postForm = document.getElementById('postForm');
let editingPost = null;

document.addEventListener("DOMContentLoaded", function () {
    // 초기화 함수 호출
    navigateToBoard(1); // 기본적으로 '명진당'으로 설정
    // 기본 정렬을 최신순으로 설정
    document.getElementById('sortOptions').value = 'latest';
    sortPosts();
    // 실시간 날짜/시간 업데이트 설정
    updateDateTime();
    setInterval(updateDateTime, 1000);  // 1초마다 날짜/시간 업데이트

    // 새로운 평가글 작성 모달 열기 버튼 이벤트 핸들러
    document.getElementById('newPostBtn').onclick = function () {
        postModal.style.display = 'block';
        postForm.reset();
        editingPost = null;

        // 각 식당에 맞는 메뉴 설정
        const menuDescriptions = {
            1: "명진당 메뉴: 기사식당돼지불백",
            2: "학생회관 메뉴: 불맛나가사끼짬뽕",
            3: "교직원 식당 메뉴: 제육볶음",
            4: "복지동 식당 메뉴: 김치돈육조림"
        };
        const menuDescription = menuDescriptions[currentBoard] || "메뉴 정보 없음";
        const menuElement = document.createElement('p');
        menuElement.textContent = menuDescription;
        menuElement.classList.add('menu-description');

        // 별점 위에 메뉴 설명 추가
        const ratingDiv = postModal.querySelector('.rating');
        const existingMenuDescription = postModal.querySelector('.menu-description');
        if (existingMenuDescription) {
            existingMenuDescription.remove(); // 기존에 있던 설명 삭제
        }
        ratingDiv.insertAdjacentElement('beforebegin', menuElement);
    };
});

function navigateToBoard(boardNumber) {
    const restaurantNames = {
        1: '명진당',
        2: '학생회관',
        3: '교직원 식당',
        4: '복지동 식당'
    };
    const restaurantName = restaurantNames[boardNumber] || `식당 ${boardNumber}`;
    currentBoard = boardNumber;
    document.querySelector('h2').textContent = `${restaurantName} 평가`;
    loadPosts();
}

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

function closeModal() {
    postModal.style.display = 'none';
}

postForm.onsubmit = function (event) {
    event.preventDefault();
    const content = document.getElementById('content').value;
    const ratingValue = 6 - parseInt(document.querySelector('input[name="rating"]:checked').value);
    const ratingStars = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);

    // 각 식당에 맞는 메뉴 설정
    const menuDescriptions = {
        1: "명진당 메뉴: 기사식당돼지불백",
        2: "학생회관 메뉴: 불맛나가사끼짬뽕",
        3: "교직원 식당 메뉴: 제육볶음",
        4: "복지동 식당 메뉴: 김치돈육조림"
    };
    const title = menuDescriptions[currentBoard] || "메뉴 정보 없음";

    const post = { title, content, rating: ratingStars, board: currentBoard, likes: 0, dislikes: 0 };

    if (editingPost !== null) {
        updatePost(editingPost, post);
    } else {
        savePost(post);
    }

    closeModal();
    loadPosts();
};

function savePost(post) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    post.id = Date.now();
    post.date = new Date().toISOString();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function loadPosts(sortedPosts = null) {
    postList.innerHTML = '';
    let posts = sortedPosts || JSON.parse(localStorage.getItem('posts')) || [];
    posts = posts.filter(post => post.board === currentBoard);

    posts.forEach((post) => {
        // 작성 날짜 포맷 설정 (연도-월-일)
        const postDate = new Date(post.date);
        const formattedDate = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}-${String(postDate.getDate()).padStart(2, '0')}`;

        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${post.title}</h3>
            <p class="author">작성자: 사용자 | 작성일: ${formattedDate}</p>
            <div id="postContentContainer">
                <p id="postContent">${post.content}</p>
            </div>
            <p id="postRating">별점: ${post.rating}</p>
            <button onclick="likePost('${post.id}')">추천 (${post.likes})</button>
            <button onclick="dislikePost('${post.id}')">비추천 (${post.dislikes})</button>
            <button onclick="deletePost('${post.id}')">삭제</button>
        `;
        postList.appendChild(li);
    });
}






function showContent(postId) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id.toString() === postId);
    if (post) {
        postContentDiv.innerHTML = `
            <p id="postRating">별점: ${post.rating}</p>
            <div id="postContentContainer">
                <p id="postContent">${post.content}</p>
            </div>
        `;
        contentModal.style.display = 'block';
    }
}


function closeContentModal() {
    contentModal.style.display = 'none';
}

function likePost(postId) {
    let posts = JSON.parse(localStorage.getItem('posts'));
    const postIndex = posts.findIndex(p => p.id.toString() === postId);
    if (postIndex !== -1) {
        posts[postIndex].likes += 1;
        localStorage.setItem('posts', JSON.stringify(posts));
        refreshPosts(posts); // 기존 UI를 갱신하는 함수 호출
    }
}

function dislikePost(postId) {
    let posts = JSON.parse(localStorage.getItem('posts'));
    const postIndex = posts.findIndex(p => p.id.toString() === postId);
    if (postIndex !== -1) {
        posts[postIndex].dislikes += 1;
        localStorage.setItem('posts', JSON.stringify(posts));
        refreshPosts(posts); // 기존 UI를 갱신하는 함수 호출
    }
}
function refreshPosts(posts = null) {
    postList.innerHTML = '';
    posts = posts || JSON.parse(localStorage.getItem('posts')) || [];
    posts = posts.filter(post => post.board === currentBoard);

    posts.forEach((post) => {
        const postDate = new Date(post.date);
        const formattedDate = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}-${String(postDate.getDate()).padStart(2, '0')}`;

        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${post.title}</h3>
            <p class="author">작성자: 사용자 | 작성일: ${formattedDate}</p>
            <div id="postContentContainer">
                <p id="postContent">${post.content}</p>
            </div>
            <p id="postRating">별점: ${post.rating}</p>
            <button onclick="likePost('${post.id}')">추천 (${post.likes})</button>
            <button onclick="dislikePost('${post.id}')">비추천 (${post.dislikes})</button>
            <button onclick="deletePost('${post.id}')">삭제</button>
        `;
        postList.appendChild(li);
    });
}

function deletePost(postId) {
    let posts = JSON.parse(localStorage.getItem('posts'));
    posts = posts.filter(p => p.id.toString() !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}

function logout() {
    alert('로그아웃되었습니다.');
    window.location.href = 'login.html';
}

function goHome() {
    window.location.href = "index.html"; 
}
function filterPosts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const posts = document.querySelectorAll('#postList li');

    posts.forEach(post => {
        const title = post.querySelector('h3').textContent.toLowerCase();
        const content = post.querySelector('.author') ? post.querySelector('.author').textContent.toLowerCase() : '';
        if (title.includes(searchInput) || content.includes(searchInput)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}
function sortPosts() {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts = posts.filter(post => post.board === currentBoard);

    const selectedOption = document.getElementById('sortOptions').value;

    if (selectedOption === 'popular') {
        posts.sort((a, b) => b.likes - a.likes); // 추천 수가 많은 순으로 정렬
    } else if (selectedOption === 'rating') {
        posts.sort((a, b) => {
            // 별점 값 비교: '★'의 개수를 정수로 변환 후 비교
            const aStars = (a.rating.match(/★/g) || []).length;
            const bStars = (b.rating.match(/★/g) || []).length;
            if (bStars === aStars) {
                // 별점이 같으면 최신순으로 정렬
                return new Date(b.date) - new Date(a.date);
            }
            return bStars - aStars;
        });
    } else {
        // 기본 최신순 정렬
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    loadPosts(posts); // 정렬된 결과를 화면에 반영
}



