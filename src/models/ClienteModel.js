const pool = require('../config/db');

class ClienteModel {
  static findAll() {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT u.id, u.username, u.email, u.rol, u.created_at,
               c.nombre, c.apellido, c.cedula, c.telefono, c.direccion, c.fecha_nacimiento, c.genero
        FROM usuarios u
        LEFT JOIN clientes c ON u.id = c.usuario_id
        WHERE u.rol = 'Cliente'
      `)
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT u.id, u.username, u.email, u.rol, u.created_at,
               c.nombre, c.apellido, c.cedula, c.telefono, c.direccion, c.fecha_nacimiento, c.genero
        FROM usuarios u
        LEFT JOIN clientes c ON u.id = c.usuario_id
        WHERE u.id = ? AND u.rol = 'Cliente'
      `, [id])
        .then(([rows]) => resolve(rows[0] || null))
        .catch(err => reject(err));
    });
  }

  static findByUsuarioId(usuarioId) {
    return new Promise((resolve, reject) => {
      pool.execute('SELECT * FROM clientes WHERE usuario_id = ?', [usuarioId])
        .then(([rows]) => resolve(rows[0] || null))
        .catch(err => reject(err));
    });
  }

  static create({ usuarioId, nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero }) {
    return new Promise((resolve, reject) => {
      pool.execute(
        'INSERT INTO clientes (usuario_id, nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [usuarioId, nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero]
      )
        .then(([result]) => resolve(result.insertId))
        .catch(err => reject(err));
    });
  }

  static update(usuarioId, { nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero }) {
    return new Promise((resolve, reject) => {
      const updates = [];
      const values = [];

      if (nombre) { updates.push('nombre = ?'); values.push(nombre); }
      if (apellido) { updates.push('apellido = ?'); values.push(apellido); }
      if (cedula) { updates.push('cedula = ?'); values.push(cedula); }
      if (telefono !== undefined) { updates.push('telefono = ?'); values.push(telefono); }
      if (direccion !== undefined) { updates.push('direccion = ?'); values.push(direccion); }
      if (fecha_nacimiento !== undefined) { updates.push('fecha_nacimiento = ?'); values.push(fecha_nacimiento); }
      if (genero !== undefined) { updates.push('genero = ?'); values.push(genero); }

      if (updates.length === 0) return resolve(false);

      values.push(usuarioId);
      pool.execute(`UPDATE clientes SET ${updates.join(', ')} WHERE usuario_id = ?`, values)
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }
}

module.exports = ClienteModel;
