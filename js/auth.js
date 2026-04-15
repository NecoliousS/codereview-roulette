const REPO_OWNER = 'necoliouss';
const REPO_NAME = 'codereview-roulette';

function login() {
    const token = document.getElementById('token-input').value.trim();
    if (!token) {
        alert('Please enter a token');
        return;
    }
    
    fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
    })
    .then(user => {
        localStorage.setItem('github_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        location.reload();
    })
    .catch(err => {
        alert('Error: ' + err.message);
    });
}

function logout() {
    localStorage.removeItem('github_token');
    localStorage.removeItem('user');
    location.reload();
}

function getToken() {
    return localStorage.getItem('github_token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

window.addEventListener('load', () => {
    const token = getToken();
    const user = getUser();
    
    if (token && user.login) {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('main-nav').style.display = 'block';
        document.getElementById('page-submit').style.display = 'block';
        
        document.getElementById('avatar').src = user.avatar_url;
        document.getElementById('username').textContent = user.login;
    }
});
