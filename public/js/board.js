// board.js

let currentBoard = 1;
const boards = {
    1: '명진당',
    2: '학생회관',
    3: '복지동식당',
    4: '교직원식당'
};

const postList = document.getElementById('postList');
const postModal = document.getElementById('postModal');
const contentModal = document.getElementById('contentModal'); // 글의 내용 모달
const postContentDiv = document.getElementById('postContent'); // 글의 내용 표시 영역
const postForm = document.getElementById('postForm');
let selectedPostId = null; // 선택한 게시글 ID 저장
let sortBy = 'latest'; // 'latest', 'likes', 'title' 중 하나
let currentUser = null; // 현재 로그인한 사용자 정보 저장

// 사용자 정보 가져오기
async function getUserProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include', // 쿠키를 포함하여 요청
        });
        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
        } else {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
}

function navigateToBoard(boardId) {
    currentBoard = boardId;
    document.querySelector('h2').textContent = `${boards[boardId]} 게시판`;
    loadPosts();
}

// 페이지 로드 시 게시글 로딩 및 사용자 정보 가져오기
window.onload = function() {
    getUserProfile();
    navigateToBoard(currentBoard);
};

document.getElementById('newPostBtn').onclick = function () {
    postModal.style.display = 'block';
    postForm.reset();
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
        // 작성자 정보는 서버에서 처리
    };

    try {
        await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post),
            credentials: 'include' // 인증 정보를 포함하여 요청
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
        const response = await fetch(`/api/posts?board=${currentBoard}`, {
            credentials: 'include'
        });
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
                <p>작성자: ${post.authorName || '알 수 없음'}</p>
                <p>좋아요 수: ${post.likes}</p>
                <button onclick="openCommentModal('${post._id}'); event.stopPropagation();">댓글 보기</button>
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
        const response = await fetch(`/api/posts/${id}`, {
            credentials: 'include'
        });
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
            <p>작성자: ${post.authorName || '알 수 없음'}</p>
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
            body: JSON.stringify({ like: !isLiked }),
            credentials: 'include'
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
        const response = await fetch(`/api/posts/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.status === 403) {
            // 권한 없음 에러 처리
            const errorData = await response.json();
            alert(errorData.message); // "게시글을 지울 권한이 없습니다." 표시
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('게시글이 성공적으로 삭제되었습니다.');
        closeContentModal();
        loadPosts();
    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        alert('게시글 삭제 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
}

//이전 삭제 함수
// async function deletePost(id) {
//     if (!id) {
//         id = selectedPostId;
//     }
//     try {
//         await fetch(`/api/posts/${id}`, {
//             method: 'DELETE',
//             credentials: 'include'
//         });
//         closeContentModal();
//         loadPosts();
//     } catch (error) {
//         console.error('게시글 삭제 중 오류 발생:', error);
//     }
// }

function goHome() {
    window.location.href = '/'; // 홈으로 이동
}

// 시간 출력 함수
document.addEventListener("DOMContentLoaded", function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);  // 실시간 날짜/시간 업데이트
});

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

// 댓글 보기 모달 열기
function openCommentModal(postId) {
    console.log('열린 게시글 ID:', postId); // 디버깅을 위해 추가
    if (!postId || postId.length !== 24) {
        console.error('유효하지 않은 게시글 ID:', postId);
        alert('잘못된 게시글입니다. 다시 시도해주세요.');
        return;
    }

    selectedPostId = postId; // 선택된 게시글 ID 저장
    loadComments(postId); // 해당 게시글의 댓글 로드
    const commentModal = document.getElementById('commentModal'); // 댓글 모달 엘리먼트 가져오기
    commentModal.style.display = 'block'; // 댓글 모달 열기
}

// 댓글 모달 닫기
function closeCommentModal() {
    const commentModal = document.getElementById('commentModal'); // 댓글 모달 엘리먼트 가져오기
    commentModal.style.display = 'none'; // 댓글 모달 닫기
}

// 댓글 로드 함수
async function loadComments(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const post = await response.json();
        console.log('로드된 게시글:', post); // 디버깅을 위해 데이터 출력
        
        const commentsDiv = document.getElementById('comments');
        commentsDiv.innerHTML = ''; // 기존 댓글 초기화
        post.comments.forEach((comment) => {
            const commentElement = document.createElement('div');
            commentElement.innerHTML = `
                <p><strong>${comment.authorName}:</strong> ${comment.content}</p>
                ${
                    comment.authorId === currentUser._id
                        ? `<button onclick="deleteComment('${comment._id}')">삭제</button>`
                        : ''
                }
            `;
            commentsDiv.appendChild(commentElement);
        });
    } catch (error) {
        console.error('댓글 로드 중 오류 발생:', error);
    }
}

// 댓글 추가 이벤트 핸들러 추가
const commentForm = document.getElementById('commentForm');
commentForm.onsubmit = async function(event) {
    event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    const content = document.getElementById('commentInput').value;

    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        await fetch(`/api/posts/${selectedPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content }),
            credentials: 'include'
        });
        document.getElementById('commentInput').value = ''; // 입력 필드 초기화
        loadComments(selectedPostId); // 댓글 목록 다시 로드
    } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
    }
};

// 댓글 삭제 함수 추가
async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }

    try {
        await fetch(`/api/posts/${selectedPostId}/comments/${commentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        loadComments(selectedPostId); // 댓글 목록 다시 로드
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
    }
}