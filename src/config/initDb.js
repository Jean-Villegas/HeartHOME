const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  // Crear base de datos si no existe
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  await connection.query(`USE ${process.env.DB_NAME}`);

  // Tabla de usuarios
  await connection.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      rol ENUM('Cliente', 'Medico', 'Administrador') DEFAULT 'Cliente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Tabla de médicos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS medicos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT UNIQUE NOT NULL,
      especialidad VARCHAR(100) NOT NULL,
      cedula VARCHAR(20) UNIQUE NOT NULL,
      telefono VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabla de clientes (información personal)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT UNIQUE NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      cedula VARCHAR(20) UNIQUE NOT NULL,
      telefono VARCHAR(20),
      direccion TEXT,
      fecha_nacimiento DATE,
      genero ENUM('M', 'F', 'Otro'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabla de posts (diagnósticos/tratamientos del médico al cliente)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medico_id INT NOT NULL,
      cliente_id INT NOT NULL,
      titulo VARCHAR(200) NOT NULL,
      contenido TEXT NOT NULL,
      tipo ENUM('diagnostico', 'tratamiento', 'receta', 'nota') DEFAULT 'diagnostico',
      rutina_recomendada VARCHAR(200),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabla de foros
  await connection.query(`
    CREATE TABLE IF NOT EXISTS foros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      autor_id INT NOT NULL,
      titulo VARCHAR(200) NOT NULL,
      contenido TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabla de comentarios del foro
  await connection.query(`
    CREATE TABLE IF NOT EXISTS foro_comentarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      foro_id INT NOT NULL,
      autor_id INT NOT NULL,
      comentario TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (foro_id) REFERENCES foros(id) ON DELETE CASCADE,
      FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabla de perfiles de salud (datos físicos)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS perfiles_salud (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT UNIQUE NOT NULL,
      peso_kg DECIMAL(5,2),
      altura_cm INT,
      tipo_sangre VARCHAR(10),
      color_piel VARCHAR(50),
      alergias TEXT,
      antecedentes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  // Tabla de análisis médicos (ej. sangre)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS analisis_medicos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      fecha_examen DATE,
      tipo_examen VARCHAR(100) DEFAULT 'Sangre',
      resultados_glucosa DECIMAL(6,2),
      resultados_colesterol DECIMAL(6,2),
      resultados_trigliceridos DECIMAL(6,2),
      diagnostico_paciente TEXT,
      medico_id INT,
      diagnostico_medico TEXT,
      fecha_diagnostico TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )
  `);

  console.log('Base de datos del Sistema de Salud inicializada correctamente');
  await connection.end();
}

if (require.main === module) {
  initDatabase().catch(console.error);
}

module.exports = { initDatabase };
