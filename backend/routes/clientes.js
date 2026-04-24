const express = require('express');
const router = express.Router();
const db = require('../../database/database');

// GET - Obtener todos los clientes
router.get('/', (req, res) => {
  try {
    const clientes = db.prepare('SELECT * FROM clientes').all();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// POST - Crear un cliente nuevo
router.post('/', (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;

    const nuevo = db.prepare(`
      INSERT INTO clientes (nombre, telefono, email)
      VALUES (?, ?, ?)
    `).run(nombre, telefono, email);

    res.json({ mensaje: '✅ Cliente creado!', id: nuevo.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
});

// DELETE - Eliminar un cliente
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
    res.json({ mensaje: '✅ Cliente eliminado!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

module.exports = router;