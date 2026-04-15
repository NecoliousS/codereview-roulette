const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { code, state } = req.query;
    const FRONTEND_URL = 'https://necoliouss.github.io/codereview-roulette';
    
    if (!code) {
        return res.status(400).send('Error: No code provided');
    }

    try {
        // Exchange code for access token
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: 'Ov23liQGx3lVxxhaCytQ',
                client_secret: process.env.GITHUB_CLIENT_SECRET, // We'll set this in Vercel
                code: code,
                state: state
            })
        });

        const data = await tokenRes.json();
        
        if (data.error) {
            return res.status(400).send(`OAuth Error: ${data.error_description}`);
        }

        // Redirect back to GitHub Pages with token in hash (safer than query params)
        res.redirect(`${FRONTEND_URL}#token=${data.access_token}`);
        
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
};
