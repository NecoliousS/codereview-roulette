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

// WHEN PAGE LOADS - Show either logged-in view or login box with Get Token button
window.addEventListener('load', () => {
    const token = getToken();
    const user = getUser();
    const loginBox = document.getElementById('login-box');
    const userInfo = document.getElementById('user-info');
    const app = document.getElementById('app');
    const nav = document.getElementById('main-nav');
    
    if (token && user.login) {
        // LOGGED IN - Show user info and app
        if (loginBox) loginBox.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            document.getElementById('avatar').src = user.avatar_url;
            document.getElementById('username').textContent = user.login;
        }
        if (app) app.style.display = 'block';
        if (nav) nav.style.display = 'block';
        
        // Load dashboard data if function exists
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    } else {
        // NOT LOGGED IN - Show the token input + Get Token button
        if (loginBox) {
            loginBox.innerHTML = `
                <div style="background: #161b22; padding: 25px; border-radius: 12px; border: 1px solid #30363d; max-width: 450px; margin: 0 auto;">
                    <h3 style="color: #58a6ff; margin-bottom: 20px; font-size: 20px;">🔐 Login to CodeReview Roulette</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <input type="password" id="token-input" placeholder="Paste your GitHub token here (ghp_...)" 
                               style="width: 100%; padding: 12px; margin-bottom: 12px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 8px; font-size: 14px;">
                        <button onclick="login()" style="width: 100%; background: #238636; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;">
                            Connect to GitHub
                        </button>
                    </div>

                    <div style="border-top: 1px solid #30363d; padding-top: 20px; text-align: center;">
                        <p style="color: #8b949e; font-size: 14px; margin-bottom: 12px;">Don't have a token yet?</p>
                        
                        <a href="https://github.com/settings/tokens/new?description=CodeReview%20Roulette&scopes=repo,gist" 
                           target="_blank" 
                           style="display: inline-block; background: #1f6feb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin-bottom: 10px;">
                           ⚡ Get Token (1 Click)
                        </a>
                        
                        <p style="color: #8b949e; font-size: 12px; margin-top: 10px; line-height: 1.5;">
                            Click button above → Check "repo" and "gist" boxes → Generate → Copy token → Paste here
                        </p>
                    </div>
                </div>
            `;
        }
    }
});
