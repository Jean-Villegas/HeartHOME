const pool = require('../config/db');

class PostModel {
  static findAll() {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT p.id, p.titulo, p.contenido, p.tipo, p.rutina_recomendada, p.created_at,
               u_medico.username as medico_username, u_medico.id as medico_id,
               u_cliente.username as cliente_username, u_cliente.id as cliente_id,
               c.nombre as cliente_nombre, c.apellido as cliente_apellido
        FROM posts p
        JOIN usuarios u_medico ON p.medico_id = u_medico.id
        JOIN usuarios u_cliente ON p.cliente_id = u_cliente.id
        LEFT JOIN clientes c ON u_cliente.id = c.usuario_id
        ORDER BY p.created_at DESC
      `)
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT p.id, p.titulo, p.contenido, p.tipo, p.rutina_recomendada, p.created_at,
               u_medico.username as medico_username, u_medico.id as medico_id,
               u_cliente.username as cliente_username, u_cliente.id as cliente_id,
               c.nombre as cliente_nombre, c.apellido as cliente_apellido
        FROM posts p
        JOIN usuarios u_medico ON p.medico_id = u_medico.id
        JOIN usuarios u_cliente ON p.cliente_id = u_cliente.id
        LEFT JOIN clientes c ON u_cliente.id = c.usuario_id
        WHERE p.id = ?
      `, [id])
        .then(([rows]) => resolve(rows[0] || null))
        .catch(err => reject(err));
    });
  }

  static findByClienteId(clienteId) {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT p.id, p.titulo, p.contenido, p.tipo, p.rutina_recomendada, p.created_at,
               u_medico.username as medico_username, u_medico.id as medico_id,
               c.nombre as cliente_nombre, c.apellido as cliente_apellido
        FROM posts p
        JOIN usuarios u_medico ON p.medico_id = u_medico.id
        JOIN usuarios u_cliente ON p.cliente_id = u_cliente.id
        LEFT JOIN clientes c ON u_cliente.id = c.usuario_id
        WHERE p.cliente_id = ?
        ORDER BY p.created_at DESC
      `, [clienteId])
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static create({ medicoId, clienteId, titulo, contenido, tipo, rutina_recomendada }) {
    return new Promise((resolve, reject) => {
      pool.execute(
        'INSERT INTO posts (medico_id, cliente_id, titulo, contenido, tipo, rutina_recomendada) VALUES (?, ?, ?, ?, ?, ?)',
        [medicoId, clienteId, titulo, contenido, tipo || 'diagnostico', rutina_recomendada || null]
      )
        .then(([result]) => resolve(result.insertId))
        .catch(err => reject(err));
    });
  }

  static update(id, { titulo, contenido, tipo }) {
    return new Promise((resolve, reject) => {
      const updates = [];
      const values = [];

      if (titulo) { updates.push('titulo = ?'); values.push(titulo); }
      if (contenido) { updates.push('contenido = ?'); values.push(contenido); }
      if (tipo) { updates.push('tipo = ?'); values.push(tipo); }

      if (updates.length === 0) return resolve(false);

      values.push(id);
      pool.execute(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, values)
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      pool.execute('DELETE FROM posts WHERE id = ?', [id])
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }
}

module.exports = PostModel;
