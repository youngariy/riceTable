let currentBoard = 1;
const boards = {
    1: '명진당',
    2: '학생회관',
    3: '복지동식당',
    4: '교직원식당'
};

const postList = document.getElementById('postList');
const postModal = document.getElementById('postModal');
const commentModal = document.getElementById('commentModal');
const contentModal = document.getElementById('contentModal'); // 글의 내용 모달
const postContentDiv = document.getElementById('postContent'); // 글의 내용 표시 영역
const postForm = document.getElementById('postForm');
const commentForm = document.getElementById('commentForm');
let editingPost = null;
let selectedPostId = null; // 선택한 게시글 ID 저장
let sortBy = 'latest'; // 'latest', 'likes', 'title' 중 하나

function navigateToBoard(boardId) {
    currentBoard = boardId;
    document.querySelector('h2').textContent = `${boards[boardId]} 게시판`;
    loadPosts();
}

// 페이지 로드 시 게시글 로딩
window.onload = function() {
    navigateToBoard(currentBoard);
};

document.getElementById('newPostBtn').onclick = function () {
    postModal.style.display = 'block';
    postForm.reset();
    editingPost = null;
};

function closeModal() {
    postModal.style.display = 'none';
}

postForm.onsubmit = async function (event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const post = { 
        title, 
        content, 
        board: currentBoard
    };

    try {
        await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });
        closeModal();
        loadPosts();
    } catch (error) {
        console.error('게시글 작성 중 오류 발생:', error);
    }
};

async function loadPosts() {
    postList.innerHTML = '';
    try {
        const response = await fetch(`/api/posts?board=${currentBoard}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();

        // 응답 데이터가 배열인지 확인
        if (!Array.isArray(posts)) {
            throw new Error('Posts 데이터가 배열이 아닙니다.');
        }

        // 현재의 정렬 기준에 따라 정렬합니다.
        if (sortBy === 'title') {
            posts.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'likes') {
            posts.sort((a, b) => b.likes - a.likes);
        } else if (sortBy === 'latest') {
            posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        // 게시글을 화면에 표시합니다.
        posts.forEach((post) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3 class="post-title">${post.title}</h3>
                <p>${post.content}</p>
                <p>좋아요 수: ${post.likes}</p>
            `;
            li.onclick = function() {
                showPostContent(post._id);
            };
            postList.appendChild(li);
        });
    } catch (error) {
        console.error('게시글 로드 중 오류 발생:', error);
    }
}

document.getElementById('sortOptions').addEventListener('change', function() {
    sortBy = this.value; // 선택한 정렬 기준으로 설정
    loadPosts(); // 게시글 다시 로드
});

async function showPostContent(id) {
    try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const post = await response.json();

        // 사용자별로 좋아요를 누른 게시글 목록을 가져옵니다.
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
        const isLiked = likedPosts.includes(post._id);

        selectedPostId = id; // 선택한 게시글 ID 저장

        // 모달 내용 설정
        postContentDiv.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <p>좋아요 수: ${post.likes}</p>
        `;

        // 좋아요 버튼 설정
        const likeButton = document.getElementById('likeButton');
        likeButton.textContent = isLiked ? '좋아요 취소' : '좋아요';
        likeButton.onclick = function() {
            likePost(post._id);
        };

        contentModal.style.display = 'block'; // 모달 표시
    } catch (error) {
        console.error('게시글 불러오기 중 오류 발생:', error);
    }
}

function closeContentModal() {
    contentModal.style.display = 'none';
}

async function likePost(id) {
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
    const isLiked = likedPosts.includes(id);

    try {
        await fetch(`/api/posts/${id}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ like: !isLiked })
        });

        // 좋아요 상태 업데이트
        if (isLiked) {
            likedPosts = likedPosts.filter(postId => postId !== id);
        } else {
            likedPosts.push(id);
        }
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

        showPostContent(id); // 게시글 다시 로드
    } catch (error) {
        console.error('좋아요 토글 중 오류 발생:', error);
    }
}

async function deletePost(id) {
    if (!id) {
        id = selectedPostId;
    }
    try {
        await fetch(`/api/posts/${id}`, {
            method: 'DELETE'
        });
        closeContentModal();
        loadPosts();
    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
    }
}

function openCommentModal() {
    commentModal.style.display = 'block';
    loadComments();
}

function closeCommentModal() {
    commentModal.style.display = 'none';
}

async function loadComments() {
    try {
        const response = await fetch(`/api/posts/${selectedPostId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const post = await response.json();

        const commentsDiv = document.getElementById('comments');
        commentsDiv.innerHTML = post.comments.map((c, index) => 
            `<p>${c} <button onclick="deleteComment('${selectedPostId}', ${index}); event.stopPropagation();">삭제</button></p>`
        ).join('');
    } catch (error) {
        console.error('댓글 로드 중 오류 발생:', error);
    }
}

async function deleteComment(postId, commentIndex) {
    try {
        await fetch(`/api/posts/${postId}/comments`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commentIndex })
        });
        loadComments();
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
    }
}

// 댓글 추가
commentForm.onsubmit = async function (event) {
    event.preventDefault();
    const comment = document.getElementById('commentInput').value;

    try {
        await fetch(`/api/posts/${selectedPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment })
        });
        commentForm.reset();
        loadComments();
    } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
    }
};

function goHome() {
    window.location.href = '/'; // 홈으로 이동
}

//시간 출력 함수
document.addEventListener("DOMContentLoaded", function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);  // 실시간 날짜/시간 업데이트
});
//시간 출력 함수 
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
    //이전 코드
    // const now = new Date();
    // const datetimeString = now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'short' });
    // document.getElementById('datetime').textContent = datetimeString;
}

