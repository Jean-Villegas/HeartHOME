const pool = require('../config/db');

class PerfilSaludModel {
  static async findByClienteId(clienteId) {
    const [rows] = await pool.execute('SELECT * FROM perfiles_salud WHERE cliente_id = ?', [clienteId]);
    return rows[0] || null;
  }

  static async upsert(clienteId, { peso_kg, altura_cm, tipo_sangre, color_piel, alergias, antecedentes, genero, edad }) {
    const existingProfile = await this.findByClienteId(clienteId);

    if (existingProfile) {
      // Update
      const [result] = await pool.execute(
        `UPDATE perfiles_salud 
         SET peso_kg = ?, altura_cm = ?, tipo_sangre = ?, color_piel = ?, alergias = ?, antecedentes = ?, genero = ?, edad = ?
         WHERE cliente_id = ?`,
        [peso_kg || existingProfile.peso_kg, 
         altura_cm || existingProfile.altura_cm, 
         tipo_sangre || existingProfile.tipo_sangre, 
         color_piel || existingProfile.color_piel, 
         alergias || existingProfile.alergias, 
         antecedentes || existingProfile.antecedentes,
         genero || existingProfile.genero,
         edad || existingProfile.edad,
         clienteId]
      );
      return result.affectedRows > 0;
    } else {
      // Insert
      const [result] = await pool.execute(
        `INSERT INTO perfiles_salud (cliente_id, peso_kg, altura_cm, tipo_sangre, color_piel, alergias, antecedentes, genero, edad)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clienteId, peso_kg || null, altura_cm || null, tipo_sangre || null, color_piel || null, alergias || null, antecedentes || null, genero || null, edad || null]
      );
      return result.insertId;
    }
  }

  static async delete(clienteId) {
    const [result] = await pool.execute('DELETE FROM perfiles_salud WHERE cliente_id = ?', [clienteId]);
    return result.affectedRows > 0;
  }
}

module.exports = PerfilSaludModel;
