const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length && (await bcrypt.compare(password, users[0].password))) {
            res.json({
                id: users[0].id,
                username: users[0].username,
                role: users[0].role,
                theme: users[0].theme || 'light',
                token: generateToken(users[0].id, users[0].role),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTheme = async (req, res) => {
    const { theme } = req.body;
    try {
        await db.query('UPDATE users SET theme = ? WHERE id = ?', [theme, req.user.id]);
        res.json({ message: 'Theme updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, updateTheme };
