const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
    }

    console.log('Token:', token);
    console.log('Secret:', process.env.JWT_SECRET);

    console.log('Token payload (decoded):', jwt.decode(token));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log('Verify error:', err);
        console.log('Decoded user:', user);
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;

        next();
    });
}

module.exports = authenticateToken;
