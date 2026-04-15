// Check auth on load
window.addEventListener('load', () => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.login) {
        // Logged in view
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('main-nav').style.display = 'block';
        document.getElementById('page-submit').style.display = 'block';
        document.getElementById('avatar').src = user.avatar_url;
        document.getElementById('username').textContent = user.login;
    } else {
        // NOT LOGGED IN - Show token input + Get Token button
        document.getElementById('login-box').innerHTML = `
            <div style="background: #161b22; padding: 20px; border-radius: 8px; border: 1px solid #30363d; max-width: 500px;">
                <h3 style="color: #58a6ff; margin-bottom: 15px;">🔐 Login with GitHub Token</h3>
                
                <div style="margin-bottom: 15px;">
                    <input type="password" id="token-input" placeholder="Paste token here (ghp_...)" 
                           style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; border: 1px solid #30363d; color: white; border-radius: 6px;">
                    <button onclick="login()" style="width: 100%; background: #238636; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Connect to GitHub
                    </button>
                </div>

                <div style="border-top: 1px solid #30363d; padding-top: 15px; text-align: center;">
                    <p style="color: #8b949e; font-size: 13px; margin-bottom: 10px;">Don't have a token?</p>
                    <a href="https://github.com/settings/tokens/new?description=CodeReview%20Roulette&scopes=repo,gist" 
                       target="_blank" 
                       style="display: inline-block; background: #1f6feb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
                        ⚡ Get Token (1 Click)
                    </a>
                    <p style="color: #8b949e; font-size: 11px; margin-top: 10px;">
                        Click above → Check "repo" and "gist" → Generate → Copy → Paste here
                    </p>
                </div>
            </div>
        `;
    }
});
