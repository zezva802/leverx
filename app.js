require('dotenv').config();
const express = require('express');
const { version } = require('./package.json');
const logger = require('./logger');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { readUsers, writeUsers } = require('./storage');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./auth.js');
const {readPosts, writePosts} = require('./postStorage');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const appEvents = require('./events');

// Subscribe to profileUpdated
appEvents.on('profileUpdated', (user) => {
    console.log(`📧 Email sent to ${user.email}: Your profile was updated!`);
});

// Middleware for logging all requests
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// test route
app.get('/test-middleware', authenticateToken, (req, res) => {
    console.log('✅ Middleware passed, user:', req.user);
    res.json({ message: 'Middleware worked!' });
});

app.get('/health', (req, res) => {
    logger.info('Health check endpoint was called');
    res.set({
        'Cache-Control': 'no-store',
        Date: new Date().toUTCString(),
    });
    res.status(200).json({ version });
});

app.post('/register', async (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const users = readUsers();

    if (users.some((u) => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: uuidv4(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ error: 'Email and password are required' });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log('Generated token:', token);
    console.log('Token payload:', jwt.decode(token));

    res.json({ token });
});

app.get('/profile', authenticateToken, (req, res) => {
    const users = readUsers();
    console.log(req.user);
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    });
});

app.put('/profile', authenticateToken, (req, res) => {
    const { firstName, lastName } = req.body;

    if (!firstName && !lastName) {
        return res.status(400).json({
            error: 'At least one field (firstName or lastName) is required',
        });
    }

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === req.user.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Update only allowed fields
    if (firstName) users[userIndex].firstName = firstName;
    if (lastName) users[userIndex].lastName = lastName;

    writeUsers(users);

    // Emit profileUpdated event
    const updatedUser = users[userIndex];
    const appEvents = require('./events');
    appEvents.emit('profileUpdated', updatedUser);

    res.json({
        message: 'Profile updated successfully',
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
    });
});

app.post('/posts', authenticateToken, (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const posts = readPosts();

    const newPost = {
        id: uuidv4(),
        title,
        description,
        createdDate: new Date().toISOString(),
        authorId: req.user.id
    };

    posts.push(newPost);
    writePosts(posts);

    res.status(201).json({ message: 'Post created successfully', post: newPost });
});


app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
