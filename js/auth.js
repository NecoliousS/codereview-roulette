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
    const loginBox = document.getElementById('login-box');
    const userInfo = document.getElementById('user-info');
    const app = document.querySelector('section#page-submit');
    const nav = document.getElementById('main-nav');
    
    if (token && user.login) {
        // LOGGED IN
        if (loginBox) loginBox.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            document.getElementById('avatar').src = user.avatar_url;
            document.getElementById('username').textContent = user.login;
        }
        if (app) app.style.display = 'block';
        if (nav) nav.style.display = 'block';
        
        if (typeof loadDashboard === 'function') loadDashboard();
    } else {
        // NOT LOGGED IN - Show login with Get Token button
        if (loginBox) {
            loginBox.innerHTML = `
                <div style="background: #161b22; padding: 25px; border-radius: 12px; border: 1px solid #30363d; max-width: 450px;">
                    <h3 style="color: #58a6ff; margin-bottom: 20px;">🔐 Login to CodeReview Roulette</h3>
                    <input type="password" id="token-input" placeholder="Paste your GitHub token (ghp_...)" 
                           style="width: 100%; padding: 12px; margin-bottom: 12px; background: #0d1117; border: 1px solid #30363d; color: white; border-radius: 8px;">
                    <button onclick="login()" style="width: 100%; background: #238636; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">
                        Connect to GitHub
                    </button>
                    <div style="border-top: 1px solid #30363d; padding-top: 20px; text-align: center;">
                        <p style="color: #8b949e; font-size: 13px; margin-bottom: 10px;">Don't have a token?</p>
                        <a href="https://github.com/settings/tokens/new?description=CodeReview%20Roulette&scopes=repo,gist" target="_blank" 
                           style="display: inline-block; background: #1f6feb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                           ⚡ Get Token (1 Click)
                        </a>
                        <p style="color: #8b949e; font-size: 11px; margin-top: 10px;">
                            Click above → Check "repo" and "gist" → Generate → Copy → Paste
                        </p>
                    </div>
                </div>
            `;
        }
        if (userInfo) userInfo.style.display = 'none';
        if (nav) nav.style.display = 'none';
        document.querySelectorAll('section.page').forEach(p => p.style.display = 'none');
    }
});
