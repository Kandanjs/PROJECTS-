// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SQLite DB setup
const db = new sqlite3.Database('quickpoll');

db.run(`CREATE TABLE IF NOT EXISTS polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER,
  option_text TEXT,
  votes INTEGER DEFAULT 0
)`);

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create Poll (POST /poll)
app.post('/poll', (req, res) => {
  const { question, options } = req.body;

  db.run(`INSERT INTO polls (question) VALUES (?)`, [question], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to create poll' });

    const pollId = this.lastID;
    const stmt = db.prepare(`INSERT INTO options (poll_id, option_text) VALUES (?, ?)`);
    options.forEach(opt => stmt.run(pollId, opt));
    stmt.finalize();

    res.json({ id: pollId });
  });
});

// Get Poll (GET /poll/:id)
app.get('/poll/:id', (req, res) => {
  const pollId = req.params.id;

  db.get(`SELECT * FROM polls WHERE id = ?`, [pollId], (err, poll) => {
    if (err || !poll) return res.status(404).json({ error: 'Poll not found' });

    db.all(`SELECT * FROM options WHERE poll_id = ?`, [pollId], (err, options) => {
      res.json({ id: poll.id, question: poll.question, options });
    });
  });
});

// Vote (POST /vote)
app.post('/vote', (req, res) => {
  const { optionId } = req.body;

  db.run(`UPDATE options SET votes = votes + 1 WHERE id = ?`, [optionId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to vote' });
    res.json({ success: true });
  });
});

// Start server for local + LAN access
app.listen(3000, '0.0.0.0', () => {
  console.log('🌐 Server running at http://192.168.137.1:3000');
});
