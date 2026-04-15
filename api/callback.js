export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = 'Ov23liQGx3lVxxhaCytQ';
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  
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
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code
      })
    });

    const data = await tokenRes.json();
    
    if (data.error) {
      return res.status(400).send(`OAuth Error: ${data.error_description}`);
    }

    // Redirect back to GitHub Pages with token
    res.redirect(`https://necoliouss.github.io/codereview-roulette/#token=${data.access_token}`);
    
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
}
