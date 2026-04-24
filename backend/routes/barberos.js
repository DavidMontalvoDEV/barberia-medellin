const express = require('express');
const router = express.Router();
const db = require('../../database/database');

// GET - Obtener todos los barberos
router.get('/', (req, res) => {
  try {
    const barberos = db.prepare('SELECT * FROM barberos').all();
    res.json(barberos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los barberos' });
  }
});

// POST - Crear un barbero nuevo
router.post('/', (req, res) => {
  try {
    const { nombre, especialidad } = req.body;

    const nuevo = db.prepare(`
      INSERT INTO barberos (nombre, especialidad)
      VALUES (?, ?)
    `).run(nombre, especialidad);

    res.json({ mensaje: '✅ Barbero creado!', id: nuevo.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el barbero' });
  }
});

// PUT - Activar o desactivar un barbero
router.put('/:id/estado', (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    db.prepare('UPDATE barberos SET activo = ? WHERE id = ?').run(activo, id);
    res.json({ mensaje: '✅ Estado del barbero actualizado!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el barbero' });
  }
});

module.exports = router;