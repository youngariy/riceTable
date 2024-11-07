let currentBoard = 1;
const postList = document.getElementById('postList');
const postModal = document.getElementById('postModal');
const commentModal = document.getElementById('commentModal');
const contentModal = document.getElementById('contentModal'); // 글의 내용 모달
const postContentDiv = document.getElementById('postContent'); // 글의 내용 표시 영역
const postForm = document.getElementById('postForm');
const commentForm = document.getElementById('commentForm');
let editingPost = null;
let selectedPostId = null; // selectedPostIndex를 selectedPostId로 변경
let sortBy = 'latest'; // 'latest', 'likes', 'title' 중 하나


function navigateToBoard(boardNumber) {
    currentBoard = boardNumber;
    document.querySelector('h2').textContent = `${boardNumber}번 식당 게시판`;
    loadPosts();
}

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
    const recommend = document.querySelector('input[name="recommend"]:checked').value;
    const rating = document.querySelector('input[name="rating"]:checked').value;

    const post = { 
        title, 
        content, 
        recommend, 
        rating, 
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


function savePost(post) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    // 고유한 ID를 부여합니다.
    post.id = Date.now() + Math.random();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function quickSort(arr, compare, left = 0, right = arr.length - 1) {
    if (left >= right) return;

    let pivotIndex = partition(arr, compare, left, right);
    quickSort(arr, compare, left, pivotIndex - 1);
    quickSort(arr, compare, pivotIndex + 1, right);
}

function partition(arr, compare, left, right) {
    let pivot = arr[right];
    let i = left;

    for (let j = left; j < right; j++) {
        if (compare(arr[j], pivot) < 0) {
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
            i++;
        }
    }
    [arr[i], arr[right]] = [arr[right], arr[i]]; // Swap with pivot
    return i;
}

async function loadPosts() {
    postList.innerHTML = '';
    try {
        const response = await fetch(`/api/posts?board=${currentBoard}`);
        const posts = await response.json();

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
        const post = await response.json();

        // 사용자별로 좋아요를 누른 게시글 목록을 가져옵니다.
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
        const isLiked = likedPosts.includes(post._id);

        postList.innerHTML = ''; // 게시글 목록을 지우고
        const li = document.createElement('li');
        li.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <p>추천 여부: ${post.recommend}</p>
            <p>별점: ${post.rating}</p>
            <p>좋아요 수: ${post.likes}</p>
            <button onclick="likePost('${post._id}'); event.stopPropagation();">${isLiked ? '좋아요 취소' : '좋아요'}</button>
            <button onclick="openCommentModal('${post._id}'); event.stopPropagation();">댓글 보기</button>
            <button onclick="deletePost('${post._id}'); event.stopPropagation();">삭제</button>
            <button onclick="goBack(); event.stopPropagation();">뒤로가기</button>
        `;
        postList.appendChild(li);
    } catch (error) {
        console.error('게시글 불러오기 중 오류 발생:', error);
    }
}


function goBack() {
    loadPosts();
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
    try {
        await fetch(`/api/posts/${id}`, {
            method: 'DELETE'
        });
        goBack();
    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
    }
}


function openCommentModal(id) {
    selectedPostId = id;
    commentModal.style.display = 'block';
    loadComments();
}

function closeCommentModal() {
    commentModal.style.display = 'none';
}

async function loadComments() {
    try {
        const response = await fetch(`/api/posts/${selectedPostId}`);
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


//댓글추가
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



// 페이지 로드 시 게시글 로딩 및 초기화
window.onload = function() {
    initializePosts();
    loadPosts();
};

function initializePosts() {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let updated = false;

    posts = posts.map(post => {
        if (!Array.isArray(post.comments)) {
            post.comments = [];
            updated = true;
        }
        if (!post.id) {
            post.id = Date.now() + Math.random();
            updated = true;
        }
        return post;
    });

    if (updated) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }
}

function goHome() {
    window.location.href = '/'; // 홈으로 이동
}














// // 로컬 로지스터로 구현했던 것

// let currentBoard = 1;
// const postList = document.getElementById('postList');
// const postModal = document.getElementById('postModal');
// const commentModal = document.getElementById('commentModal');
// const contentModal = document.getElementById('contentModal'); // 글의 내용 모달
// const postContentDiv = document.getElementById('postContent'); // 글의 내용 표시 영역
// const postForm = document.getElementById('postForm');
// const commentForm = document.getElementById('commentForm');
// let editingPost = null;
// let selectedPostId = null; // selectedPostIndex를 selectedPostId로 변경
// let sortBy = 'latest'; // 'latest', 'likes', 'title' 중 하나

// function navigateToBoard(boardNumber) {
//     currentBoard = boardNumber;
//     document.querySelector('h2').textContent = `${boardNumber}번 식당 게시판`;
//     loadPosts();
// }

// document.getElementById('newPostBtn').onclick = function () {
//     postModal.style.display = 'block';
//     postForm.reset();
//     editingPost = null;
// };

// function closeModal() {
//     postModal.style.display = 'none';
// }

// postForm.onsubmit = function (event) {
//     event.preventDefault();
//     const title = document.getElementById('title').value;
//     const content = document.getElementById('content').value;
//     const recommend = document.querySelector('input[name="recommend"]:checked').value;
//     const rating = document.querySelector('input[name="rating"]:checked').value;

//     const post = { 
//         title, 
//         content, 
//         recommend, 
//         rating, 
//         board: currentBoard, 
//         comments: [], // 빈 배열로 초기화
//         likes: 0,
//         timestamp: Date.now() // 타임스탬프 추가
//     };

//     if (editingPost !== null) {
//         updatePost(editingPost, post);
//     } else {
//         savePost(post);
//     }

//     closeModal();
//     loadPosts();
// };

// function savePost(post) {
//     let posts = JSON.parse(localStorage.getItem('posts')) || [];
//     // 고유한 ID를 부여합니다.
//     post.id = Date.now() + Math.random();
//     posts.push(post);
//     localStorage.setItem('posts', JSON.stringify(posts));
// }

// function quickSort(arr, compare, left = 0, right = arr.length - 1) {
//     if (left >= right) return;

//     let pivotIndex = partition(arr, compare, left, right);
//     quickSort(arr, compare, left, pivotIndex - 1);
//     quickSort(arr, compare, pivotIndex + 1, right);
// }

// function partition(arr, compare, left, right) {
//     let pivot = arr[right];
//     let i = left;

//     for (let j = left; j < right; j++) {
//         if (compare(arr[j], pivot) < 0) {
//             [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
//             i++;
//         }
//     }
//     [arr[i], arr[right]] = [arr[right], arr[i]]; // Swap with pivot
//     return i;
// }

// function loadPosts() {
//     postList.innerHTML = '';
//     let posts = JSON.parse(localStorage.getItem('posts')) || [];

//     // comments와 id를 초기화합니다.
//     posts = posts.map(post => {
//         if (!Array.isArray(post.comments)) {
//             post.comments = [];
//         }
//         if (!post.id) {
//             post.id = Date.now() + Math.random();
//         }
//         return post;
//     });

//     // 업데이트된 게시글을 로컬 스토리지에 저장합니다.
//     localStorage.setItem('posts', JSON.stringify(posts));

//     // 현재 게시판의 게시글만 필터링합니다.
//     let filteredPosts = posts.filter(post => post.board === currentBoard);

//     // 현재의 정렬 기준에 따라 정렬합니다.
//     if (sortBy === 'title') {
//         quickSort(filteredPosts, (a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
//     } else if (sortBy === 'likes') {
//         quickSort(filteredPosts, (a, b) => b.likes - a.likes);
//     } else if (sortBy === 'latest') {
//         quickSort(filteredPosts, (a, b) => b.timestamp - a.timestamp);
//     }

//     // 게시글을 화면에 표시합니다.
//     filteredPosts.forEach((post) => {
//         const li = document.createElement('li');
//         li.innerHTML = `
//             <h3 class="post-title">${post.title}</h3>
//             <p>${post.content}</p>
//             <p>좋아요 수: ${post.likes}</p>
//         `;
//         li.onclick = function() {
//             showPostContent(post.id);
//         };
//         postList.appendChild(li);
//     });
// }

// document.getElementById('sortOptions').addEventListener('change', function() {
//     sortBy = this.value; // 선택한 정렬 기준으로 설정
//     loadPosts(); // 게시글 다시 로드
// });

// function showPostContent(id) {
//     const posts = JSON.parse(localStorage.getItem('posts')) || [];
//     const post = posts.find(p => p.id === id);

//     if (!post) {
//         alert('게시글을 찾을 수 없습니다.');
//         return;
//     }

//     // 사용자별로 좋아요를 누른 게시글 목록을 가져옵니다.
//     let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
//     const isLiked = likedPosts.includes(post.id);

//     postList.innerHTML = ''; // 게시글 목록을 지우고
//     const li = document.createElement('li');
//     li.innerHTML = `
//         <h2>${post.title}</h2>
//         <p>${post.content}</p>
//         <p>추천 여부: ${post.recommend}</p>
//         <p>별점: ${post.rating}</p>
//         <p>좋아요 수: ${post.likes}</p>
//         <button onclick="likePost(${post.id}); event.stopPropagation();">${isLiked ? '좋아요 취소' : '좋아요'}</button>
//         <button onclick="openCommentModal(${post.id}); event.stopPropagation();">댓글 보기</button>
//         <button onclick="deletePost(${post.id}); event.stopPropagation();">삭제</button>
//         <button onclick="goBack(); event.stopPropagation();">뒤로가기</button>
//     `;
//     postList.appendChild(li);
// }

// function goBack() {
//     loadPosts();
// }

// function likePost(id) {
//     let posts = JSON.parse(localStorage.getItem('posts')) || [];
//     let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
//     const post = posts.find(p => p.id === id);

//     if (post) {
//         if (likedPosts.includes(id)) {
//             // 이미 좋아요를 누른 경우, 좋아요 취소
//             post.likes -= 1;
//             likedPosts = likedPosts.filter(postId => postId !== id);
//         } else {
//             // 좋아요를 누르지 않은 경우, 좋아요 추가
//             post.likes += 1;
//             likedPosts.push(id);
//         }
//         localStorage.setItem('posts', JSON.stringify(posts));
//         localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
//         showPostContent(id); // 게시글 다시 로드
//     }
// }

// function deletePost(id) {
//     let posts = JSON.parse(localStorage.getItem('posts')) || [];
//     let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];

//     posts = posts.filter(p => p.id !== id);
//     likedPosts = likedPosts.filter(postId => postId !== id);

//     localStorage.setItem('posts', JSON.stringify(posts));
//     localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
//     goBack(); // 게시글 목록으로 돌아감
// }

// function openCommentModal(id) {
//     selectedPostId = id;
//     commentModal.style.display = 'block';
//     loadComments();
// }

// function closeCommentModal() {
//     commentModal.style.display = 'none';
// }

// function loadComments() {
//     const posts = JSON.parse(localStorage.getItem('posts')) || [];
//     const commentsDiv = document.getElementById('comments');
//     const post = posts.find(p => p.id === selectedPostId);

//     if (!post) {
//         alert('게시글을 찾을 수 없습니다.');
//         return;
//     }

//     // comments가 배열인지 확인하고 아니면 배열로 초기화
//     if (!Array.isArray(post.comments)) {
//         post.comments = [];
//         localStorage.setItem('posts', JSON.stringify(posts));
//     }

//     commentsDiv.innerHTML = post.comments.map((c, index) => 
//         `<p>${c} <button onclick="deleteComment(${selectedPostId}, ${index}); event.stopPropagation();">삭제</button></p>`
//     ).join('');
// }

// function deleteComment(postId, commentIndex) {
//     let posts = JSON.parse(localStorage.getItem('posts')) || [];
//     let post = posts.find(p => p.id === postId);
    
//     if (post && post.comments && post.comments.length > commentIndex) {
//         post.comments.splice(commentIndex, 1); // 댓글 삭제
//         localStorage.setItem('posts', JSON.stringify(posts));
//         loadComments(); // 댓글 목록 다시 로드
//     }
// }

// commentForm.onsubmit = function (event) {
//     event.preventDefault();
//     const comment = document.getElementById('commentInput').value;
//     const posts = JSON.parse(localStorage.getItem('posts')) || [];
//     const post = posts.find(p => p.id === selectedPostId);

//     if (post) {
//         // comments가 배열인지 확인하고 아니면 배열로 초기화
//         if (!Array.isArray(post.comments)) {
//             post.comments = [];
//         }

//         post.comments.push(comment);
//         localStorage.setItem('posts', JSON.stringify(posts));
//         loadComments();
//         commentForm.reset();
//     }
// };

// // 페이지 로드 시 게시글 로딩 및 초기화
// window.onload = function() {
//     initializePosts();
//     loadPosts();
// };

// function initializePosts() {
//     let posts = JSON.parse(localStorage.getItem('posts')) || [];
//     let updated = false;

//     posts = posts.map(post => {
//         if (!Array.isArray(post.comments)) {
//             post.comments = [];
//             updated = true;
//         }
//         if (!post.id) {
//             post.id = Date.now() + Math.random();
//             updated = true;
//         }
//         return post;
//     });

//     if (updated) {
//         localStorage.setItem('posts', JSON.stringify(posts));
//     }
// }

// function goHome() {
//     window.location.href = '/'; // 홈으로 이동
// }















