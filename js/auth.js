const CLIENT_ID = 'Ov23liQGx3lVxxhaCytQ';
const BACKEND_URL = 'https://YOUR_VERCEL_PROJECT.vercel.app'; // We'll create this next
const FRONTEND_URL = 'https://necoliouss.github.io/codereview-roulette';

function login() {
    // Generate random state for security
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('oauth_state', state);
    
    // Redirect to GitHub OAuth
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${BACKEND_URL}/callback&scope=repo,gist&state=${state}`;
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

// Check auth status on load
window.addEventListener('load', async () => {
    const token = getToken();
    if (token) {
        // Validate token and get user info
        try {
            const res = await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `token ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                localStorage.setItem('user', JSON.stringify(user));
                
                document.getElementById('login-btn').style.display = 'none';
                document.getElementById('user-info').style.display = 'block';
                document.getElementById('username').textContent = user.login;
                document.getElementById('avatar').src = user.avatar_url;
                document.getElementById('app').style.display = 'block';
            } else {
                // Token expired/invalid
                logout();
            }
        } catch (e) {
            logout();
        }
    }
});
