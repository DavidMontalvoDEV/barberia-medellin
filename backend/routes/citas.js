const express = require('express');
const router = express.Router();
const db = require('../../database/database');

// GET - Obtener todas las citas
router.get('/', (req, res) => {
  try {
    const citas = db.prepare('SELECT * FROM citas').all();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

// POST - Crear una nueva cita
router.post('/', (req, res) => {
  try {
    const { cliente_id, barbero_id, servicio_id, fecha, hora } = req.body;
    
    const nueva = db.prepare(`
      INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora)
      VALUES (?, ?, ?, ?, ?)
    `).run(cliente_id, barbero_id, servicio_id, fecha, hora);

    res.json({ mensaje: '✅ Cita creada!', id: nueva.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la cita' });
  }
});

// DELETE - Cancelar una cita
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM citas WHERE id = ?').run(id);
    res.json({ mensaje: '✅ Cita cancelada!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
});

module.exports = router;