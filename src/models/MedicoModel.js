const pool = require('../config/db');

class MedicoModel {
  static findAll() {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT u.id, u.username, u.email, u.rol, u.created_at,
               m.especialidad, m.cedula, m.telefono
        FROM usuarios u
        LEFT JOIN medicos m ON u.id = m.usuario_id
        WHERE u.rol = 'Medico'
      `)
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT u.id, u.username, u.email, u.rol, u.created_at,
               m.especialidad, m.cedula, m.telefono
        FROM usuarios u
        LEFT JOIN medicos m ON u.id = m.usuario_id
        WHERE u.id = ? AND u.rol = 'Medico'
      `, [id])
        .then(([rows]) => resolve(rows[0] || null))
        .catch(err => reject(err));
    });
  }

  static findByUsuarioId(usuarioId) {
    return new Promise((resolve, reject) => {
      pool.execute('SELECT * FROM medicos WHERE usuario_id = ?', [usuarioId])
        .then(([rows]) => resolve(rows[0] || null))
        .catch(err => reject(err));
    });
  }

  static create({ usuarioId, especialidad, cedula, telefono }) {
    return new Promise((resolve, reject) => {
      pool.execute(
        'INSERT INTO medicos (usuario_id, especialidad, cedula, telefono) VALUES (?, ?, ?, ?)',
        [usuarioId, especialidad, cedula, telefono]
      )
        .then(([result]) => resolve(result.insertId))
        .catch(err => reject(err));
    });
  }

  static update(usuarioId, { especialidad, cedula, telefono }) {
    return new Promise((resolve, reject) => {
      const updates = [];
      const values = [];

      if (especialidad) {
        updates.push('especialidad = ?');
        values.push(especialidad);
      }
      if (cedula) {
        updates.push('cedula = ?');
        values.push(cedula);
      }
      if (telefono !== undefined) {
        updates.push('telefono = ?');
        values.push(telefono);
      }

      if (updates.length === 0) {
        return resolve(false);
      }

      values.push(usuarioId);
      pool.execute(`UPDATE medicos SET ${updates.join(', ')} WHERE usuario_id = ?`, values)
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }

  static delete(usuarioId) {
    return new Promise((resolve, reject) => {
      pool.execute('DELETE FROM medicos WHERE usuario_id = ?', [usuarioId])
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }
}

module.exports = MedicoModel;
