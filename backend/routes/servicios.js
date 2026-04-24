const express = require('express');
const router = express.Router();
const db = require('../../database/database');

// GET - Obtener todos los servicios
router.get('/', (req, res) => {
  try {
    const servicios = db.prepare('SELECT * FROM servicios').all();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
});

// POST - Crear un servicio nuevo
router.post('/', (req, res) => {
  try {
    const { nombre, duracion, precio } = req.body;

    const nuevo = db.prepare(`
      INSERT INTO servicios (nombre, duracion, precio)
      VALUES (?, ?, ?)
    `).run(nombre, duracion, precio);

    res.json({ mensaje: '✅ Servicio creado!', id: nuevo.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
});

// PUT - Actualizar precio de un servicio
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, duracion, precio } = req.body;

    db.prepare(`
      UPDATE servicios 
      SET nombre = ?, duracion = ?, precio = ?
      WHERE id = ?
    `).run(nombre, duracion, precio, id);

    res.json({ mensaje: '✅ Servicio actualizado!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el servicio' });
  }
});

// DELETE - Eliminar un servicio
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM servicios WHERE id = ?').run(id);
    res.json({ mensaje: '✅ Servicio eliminado!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  }
});

module.exports = router;