const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Get all notes for user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, title, content || '']
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
