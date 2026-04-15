const CLIENT_ID = 'Ov23liQGx3lVxxhaCytQ';
const REDIRECT_URI = 'https://codereview-roulette.vercel.app/api/callback'; // We'll get this URL after deploying

function login() {
    // Generate random state for security
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state);
    
    // Redirect to GitHub OAuth
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,gist&state=${state}`;
    window.location.href = githubUrl;
}

function logout() {
    localStorage.removeItem('github_token');
    localStorage.removeItem('user');
    location.reload();
}

function getToken() {
    return localStorage.getItem('github_token');
}

// Check for token in URL (after OAuth redirect)
window.addEventListener('load', () => {
    const hash = window.location.hash;
    if (hash.includes('token=')) {
        const token = hash.split('token=')[1].split('&')[0];
        localStorage.setItem('github_token', token);
        window.location.hash = '';
        
        // Verify token and get user info
        fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${token}` }
        })
        .then(res => res.json())
        .then(user => {
            localStorage.setItem('user', JSON.stringify(user));
            location.reload();
        });
        return;
    }
    
    // Normal load - check if logged in
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.login) {
        document.getElementById('login-box').innerHTML = `
            <button onclick="login()" style="background:#333;color:#fff;">Login with GitHub</button>
        `;
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('main-nav').style.display = 'block';
        document.getElementById('page-submit').style.display = 'block';
        document.getElementById('avatar').src = user.avatar_url;
        document.getElementById('username').textContent = user.login;
    } else {
        // Show login button
        document.getElementById('login-box').innerHTML = `
            <button onclick="login()" style="background:#333;color:#fff;padding:10px 20px;">
                <svg height="16" viewBox="0 0 16 16" width="16" style="vertical-align:middle;margin-right:8px;">
                    <path fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                Login with GitHub
            </button>
        `;
    }
});
