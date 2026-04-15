// Your GitHub username and repo name
const REPO_OWNER = 'necoliouss';
const REPO_NAME = 'codereview-roulette';

function login() {
    // Get the token from the input box
    const tokenInput = document.getElementById('token-input');
    const token = tokenInput ? tokenInput.value.trim() : prompt("Enter your GitHub Personal Access Token:");
    
    if (!token) {
        alert('Please enter a token');
        return;
    }
    
    // Test the token by trying to get user info
    fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
    })
    .then(user => {
        // Save to browser storage
        localStorage.setItem('github_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        alert(`Welcome, ${user.login}!`);
        location.reload();
    })
    .catch(err => {
        alert('Error: ' + err.message + '. Make sure you generated a token with "repo" scope.');
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

// When page loads, check if already logged in
window.addEventListener('load', () => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.login) {
        // Hide login box, show user info
        const loginBox = document.getElementById('login-box');
        const userInfo = document.getElementById('user-info');
        const app = document.getElementById('app');
        
        if (loginBox) loginBox.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (app) app.style.display = 'block';
        
        // Fill in user details
        const avatar = document.getElementById('avatar');
        const username = document.getElementById('username');
        if (avatar) avatar.src = user.avatar_url;
        if (username) username.textContent = user.login;
    }
});
