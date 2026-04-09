const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Actualizando base de datos...');

    // Verificar si las columnas ya existen
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'analisis_medicos'
    `, [process.env.DB_NAME]);

    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Columnas existentes:', columnNames);

    // Agregar columnas faltantes si no existen
    if (!columnNames.includes('medico_id')) {
      await connection.query(`
        ALTER TABLE analisis_medicos 
        ADD COLUMN medico_id INT,
        ADD CONSTRAINT fk_medico_id FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE SET NULL
      `);
      console.log('Columna medico_id agregada');
    }

    if (!columnNames.includes('diagnostico_medico')) {
      await connection.query(`
        ALTER TABLE analisis_medicos 
        ADD COLUMN diagnostico_medico TEXT
      `);
      console.log('Columna diagnostico_medico agregada');
    }

    if (!columnNames.includes('fecha_diagnostico')) {
      await connection.query(`
        ALTER TABLE analisis_medicos 
        ADD COLUMN fecha_diagnostico TIMESTAMP NULL
      `);
      console.log('Columna fecha_diagnostico agregada');
    }

    console.log('Base de datos actualizada correctamente');
  } catch (error) {
    console.error('Error actualizando la base de datos:', error);
  } finally {
    await connection.end();
  }
}

updateDatabase().catch(console.error);
