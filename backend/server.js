const express = require('express');
const cors = require('cors');
const db = require('../database/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Importar rutas
const citasRoutes = require('./routes/citas');
const clientesRoutes = require('./routes/clientes');
const barberosRoutes = require('./routes/barberos');
const serviciosRoutes = require('./routes/servicios');

// Usar rutas
app.use('/citas', citasRoutes);
app.use('/clientes', clientesRoutes);
app.use('/barberos', barberosRoutes);
app.use('/servicios', serviciosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: '✅ Servidor de Barbería funcionando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});