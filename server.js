const express = require('express');
const cors = require('cors');
const connectToDB = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let notesCollection;

connectToDB().then(db => {
  notesCollection = db.collection('notes');
});

// Save a new note
app.post('/api/note', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Note text is required" });

  try {
    const result = await notesCollection.insertOne({ text, createdAt: new Date() });
    res.json({ message: 'Note saved', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Get the latest note
app.get('/api/note', async (req, res) => {
  try {
    const latestNote = await notesCollection.find().sort({ createdAt: -1 }).limit(1).toArray();
    res.json({ note: latestNote[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
