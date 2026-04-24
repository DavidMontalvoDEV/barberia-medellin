const Database = require('better-sqlite3');
const path = require('path');

// Crear/conectar la base de datos
const db = new Database(path.join(__dirname, 'barberia.db'));

// Crear las tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS barberos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especialidad TEXT,
    activo INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    duracion INTEGER NOT NULL,
    precio REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    barbero_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (barbero_id) REFERENCES barberos(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
  );
`);

console.log('✅ Base de datos lista!');

module.exports = db;