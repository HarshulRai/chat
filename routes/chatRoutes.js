const express = require('express');
const router = express.Router();
const pool = require('./db');

router.post('/send', async (req, res) => {
    const { senderUsername, receiverUsername, message } = req.body;

    try {
        // Fetch sender and receiver IDs
        const sender = await pool.query('SELECT id FROM users WHERE username = $1', [senderUsername]);
        const receiver = await pool.query('SELECT id FROM users WHERE username = $1', [receiverUsername]);
        if (sender.rows.length === 0 || receiver.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid sender or receiver username.' });
        }

        const senderId = sender.rows[0].id;
        const receiverId = receiver.rows[0].id;

        // Insert message into database
        await pool.query('INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', [senderId, receiverId, message]);
        res.status(201).json({ message: 'Message sent successfully.' });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get('/messages/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userId = user.rows[0].id;
        const messages = await pool.query('SELECT sender_id, message FROM chat_messages WHERE receiver_id = $1', [userId]);
        res.json(messages.rows);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
