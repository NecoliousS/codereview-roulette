// PAGE NAVIGATION
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected page
    document.getElementById(`page-${pageName}`).style.display = 'block';
    event.target.classList.add('active');
    
    // Load data if needed
    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'browse') loadRandomCode();
}

// SUBMIT CODE (PAGE 1)
document.getElementById('review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    
    try {
        const token = getToken();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const code = document.getElementById('code').value;
        const language = document.getElementById('language').value;
        const user = getUser();
        
        // 1. Create Gist
        const gistRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: `CodeReview: ${title}`,
                public: false,
                files: { 'code.txt': { content: code } }
            })
        });
        const gist = await gistRes.json();
        
        // 2. Create Issue
        const bodyText = `**Author:** @${user.login}
**Language:** ${language}
**Description:** ${description || 'No description provided'}

**Gist:** ${gist.html_url}

---
To review this code, comment below or on the gist directly.`;
        
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
            method: 'POST',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `[REVIEW] ${title}`,
                body: bodyText,
                labels: ['review-request', `lang-${language}`, `author-${user.login}`]
            })
        });
        
        alert('Submitted successfully! Check the Issues tab in your repo.');
        e.target.reset();
        
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.textContent = 'Submit for Review';
        btn.disabled = false;
    }
});

// BROWSE RANDOM CODE (PAGE 2)
async function loadRandomCode() {
    const container = document.getElementById('random-code-display');
    container.innerHTML = '<p>Loading...</p>';
    
    try {
        // Get all open review requests NOT by current user
        const user = getUser();
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=review-request&state=open`);
        const issues = await res.json();
        
        // Filter out user's own submissions
        const othersIssues = issues.filter(issue => issue.user.login !== user.login);
        
        if (othersIssues.length === 0) {
            container.innerHTML = '<p>No code available to review right now. Check back later!</p>';
            return;
        }
        
        // Pick random one
        const randomIssue = othersIssues[Math.floor(Math.random() * othersIssues.length)];
        
        // Extract gist URL from body
        const gistMatch = randomIssue.body.match(/Gist: (https:\/\/gist\.github\.com\/[^)]+)/);
        const gistUrl = gistMatch ? gistMatch[1] : null;
        
        let codeContent = 'Code not available';
        if (gistUrl) {
            // Fetch gist content
            const gistId = gistUrl.split('/').pop();
            const gistRes = await fetch(`https://api.github.com/gists/${gistId}`);
            const gistData = await gistRes.json();
            codeContent = gistData.files['code.txt']?.content || 'Error loading code';
        }
        
        // Get comments (reviews)
        const commentsRes = await fetch(randomIssue.comments_url);
        const comments = await commentsRes.json();
        
        container.innerHTML = `
            <div class="card">
                <h4>${randomIssue.title.replace('[REVIEW] ', '')}</h4>
                <div class="meta">
                    <span class="badge">${randomIssue.labels.find(l => l.name.startsWith('lang-'))?.name.replace('lang-', '') || 'code'}</span>
                    By: @${randomIssue.user.login}
                </div>
                <pre><code>${escapeHtml(codeContent)}</code></pre>
                
                <div class="feedback-section">
                    <h4>Previous Feedback (${comments.length})</h4>
                    ${comments.length ? comments.map(c => `
                        <div class="feedback-item">
                            <strong>@${c.user.login}:</strong> ${c.body}
                        </div>
                    `).join('') : '<p>No feedback yet. Be the first!</p>'}
                    
                    <div class="feedback-form">
                        <textarea id="feedback-text" rows="3" placeholder="Write your review..."></textarea>
                        <button onclick="submitFeedback(${randomIssue.number})">Submit Review</button>
                    </div>
                </div>
            </div>
        `;
        
    } catch (err) {
        container.innerHTML = '<p>Error loading code. Try again.</p>';
        console.error(err);
    }
}

async function submitFeedback(issueNumber) {
    const text = document.getElementById('feedback-text').value;
    if (!text.trim()) return alert('Please write something');
    
    try {
        const token = getToken();
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`, {
            method: 'POST',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: text })
        });
        
        alert('Review submitted! Thanks!');
        loadRandomCode(); // Refresh
        
    } catch (err) {
        alert('Error submitting review');
    }
}

// DASHBOARD (PAGE 3)
async function loadDashboard() {
    const user = getUser();
    const token = getToken();
    
    try {
        // My Submissions (issues created by me)
        const myIssuesRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?creator=${user.login}&state=all&per_page=10`);
        const myIssues = await myIssuesRes.json();
        
        const submissionsDiv = document.getElementById('my-submissions');
        if (myIssues.length === 0) {
            submissionsDiv.innerHTML = '<p class="empty">You haven\'t submitted anything yet</p>';
        } else {
            submissionsDiv.innerHTML = myIssues.map(issue => {
                const isClosed = issue.state === 'closed';
                const statusBadge = isClosed ? '<span class="badge reviewed">Reviewed</span>' : '<span class="badge pending">Pending</span>';
                
                return `
                <div class="card">
                    <h4>${issue.title.replace('[REVIEW] ', '')}</h4>
                    <div class="meta">${statusBadge} ${issue.comments} comments</div>
                    <a href="${issue.html_url}" target="_blank">View on GitHub →</a>
                </div>
                `;
            }).join('');
        }
        
        // My Reviews (comments I made on others' issues)
        // GitHub API doesn't have a direct "comments by user" endpoint, so we get creative
        const allOpenRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&per_page=50`);
        const allOpen = await allOpenRes.json();
        
        // Find issues I've commented on (not created)
        const reviewsGiven = [];
        for (const issue of allOpen) {
            if (issue.user.login === user.login) continue; // Skip my own
            
            const commentsRes = await fetch(issue.comments_url);
            const comments = await commentsRes.json();
            const myComments = comments.filter(c => c.user.login === user.login);
            
            if (myComments.length > 0) {
                reviewsGiven.push({
                    issue: issue,
                    myComments: myComments
                });
            }
        }
        
        const reviewsDiv = document.getElementById('my-reviews');
        if (reviewsGiven.length === 0) {
            reviewsDiv.innerHTML = '<p class="empty">You haven\'t reviewed anyone\'s code yet</p>';
        } else {
            reviewsDiv.innerHTML = reviewsGiven.map(r => `
                <div class="card">
                    <h4>${r.issue.title.replace('[REVIEW] ', '')}</h4>
                    <div class="meta">You gave ${r.myComments.length} feedback(s)</div>
                    <div class="feedback-item">${r.myComments[0].body.substring(0, 100)}...</div>
                    <a href="${r.issue.html_url}" target="_blank">View thread →</a>
                </div>
            `).join('');
        }
        
    } catch (err) {
        console.error(err);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
