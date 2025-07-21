const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let tasks = [];

// Start a task
app.post('/task', (req, res) => {
  const { name, duration } = req.body;
  const startTime = new Date();
  tasks.push({ name, duration, startTime, completed: false });
  res.status(201).json({ message: "Task started" });
});

// Complete a task
app.post('/task/complete', (req, res) => {
  const { name } = req.body;
  const task = tasks.find(t => t.name === name && !t.completed);
  if (task) {
    task.completed = true;
    task.endTime = new Date();
    task.timeSpent = (task.endTime - task.startTime) / 1000; // in seconds
    return res.json({ message: "Task marked complete", task });
  }
  res.status(404).json({ message: "Task not found or already completed" });
});

// Get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Start server
app.listen(3000, () => {
  console.log("✅ Server listening on http://localhost:3000");
});
