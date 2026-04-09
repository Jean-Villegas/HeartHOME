const pool = require('../config/db');

class AnalisisModel {
  static async findAllByClienteId(clienteId) {
    const [rows] = await pool.execute('SELECT * FROM analisis_medicos WHERE cliente_id = ? ORDER BY fecha_examen DESC', [clienteId]);
    return rows;
  }

  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT a.*, u.username as cliente_username, u.email as cliente_email 
      FROM analisis_medicos a 
      JOIN usuarios u ON a.cliente_id = u.id 
      ORDER BY a.fecha_examen DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM analisis_medicos WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ cliente_id, fecha_examen, tipo_examen, resultados_glucosa, resultados_colesterol, resultados_trigliceridos, diagnostico_paciente }) {
    try {
      const query = `INSERT INTO analisis_medicos (cliente_id, fecha_examen, tipo_examen, resultados_glucosa, resultados_colesterol, resultados_trigliceridos, diagnostico_paciente)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        cliente_id, 
        fecha_examen || new Date().toISOString().slice(0, 10), 
        tipo_examen || 'Sangre',
        resultados_glucosa || null,
        resultados_colesterol || null,
        resultados_trigliceridos || null,
        diagnostico_paciente || null
      ];

      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Error en base de datos al crear análisis:', error.message);
      throw error;
    }
  }

  static async updateDiagnosis(id, { diagnostico_medico, medico_id }) {
    try {
      // Primero verificar si las columnas existen
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'analisis_medicos'
      `);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      if (columnNames.includes('diagnostico_medico') && columnNames.includes('medico_id')) {
        // Usar la estructura completa con las nuevas columnas
        const [result] = await pool.execute(
          `UPDATE analisis_medicos 
           SET diagnostico_medico = ?, medico_id = ?, fecha_diagnostico = NOW()
           WHERE id = ?`,
          [diagnostico_medico, medico_id, id]
        );
        return result.affectedRows > 0;
      } else {
        // Usar solo las columnas existentes (versión compatible)
        const [result] = await pool.execute(
          `UPDATE analisis_medicos 
           SET diagnostico_paciente = CONCAT(IFNULL(diagnostico_paciente, ''), '\n\nDIAGNÓSTICO MÉDICO: ', ?)
           WHERE id = ?`,
          [diagnostico_medico, id]
        );
        return result.affectedRows > 0;
      }
    } catch (error) {
      console.error('Error en updateDiagnosis:', error);
      throw error;
    }
  }

  static async delete(id, clienteId) {
    const [result] = await pool.execute('DELETE FROM analisis_medicos WHERE id = ? AND cliente_id = ?', [id, clienteId]);
    return result.affectedRows > 0;
  }
}

module.exports = AnalisisModel;
