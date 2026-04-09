const pool = require('../config/db');

class ForoModel {
  static findAll() {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT f.id, f.titulo, f.contenido, f.created_at,
               u.username as autor_username, u.id as autor_id, u.rol as autor_rol,
               (SELECT COUNT(*) FROM foro_comentarios fc WHERE fc.foro_id = f.id) as comentarios_count
        FROM foros f
        JOIN usuarios u ON f.autor_id = u.id
        ORDER BY f.created_at DESC
      `)
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static search(term) {
    return new Promise((resolve, reject) => {
      const query = `%${term}%`;
      pool.execute(`
        SELECT f.id, f.titulo, f.contenido, f.created_at,
               u.username as autor_username, u.id as autor_id, u.rol as autor_rol,
               (SELECT COUNT(*) FROM foro_comentarios fc WHERE fc.foro_id = f.id) as comentarios_count
        FROM foros f
        JOIN usuarios u ON f.autor_id = u.id
        WHERE f.titulo LIKE ? OR f.contenido LIKE ? OR u.username LIKE ?
        ORDER BY f.created_at DESC
      `, [query, query, query])
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT f.id, f.titulo, f.contenido, f.created_at,
               u.username as autor_username, u.id as autor_id, u.rol as autor_rol
        FROM foros f
        JOIN usuarios u ON f.autor_id = u.id
        WHERE f.id = ?
      `, [id])
        .then(([rows]) => resolve(rows[0] || null))
        .catch(err => reject(err));
    });
  }

  static create({ autorId, titulo, contenido }) {
    return new Promise((resolve, reject) => {
      pool.execute(
        'INSERT INTO foros (autor_id, titulo, contenido) VALUES (?, ?, ?)',
        [autorId, titulo, contenido]
      )
        .then(([result]) => resolve(result.insertId))
        .catch(err => reject(err));
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      pool.execute('DELETE FROM foros WHERE id = ?', [id])
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }
}

// Modelo de Comentarios del Foro
class ForoComentarioModel {
  static findByForoId(foroId) {
    return new Promise((resolve, reject) => {
      pool.execute(`
        SELECT fc.id, fc.comentario, fc.created_at,
               u.username as autor_username, u.id as autor_id, u.rol as autor_rol
        FROM foro_comentarios fc
        JOIN usuarios u ON fc.autor_id = u.id
        WHERE fc.foro_id = ?
        ORDER BY fc.created_at ASC
      `, [foroId])
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    });
  }

  static create({ foroId, autorId, comentario }) {
    return new Promise((resolve, reject) => {
      pool.execute(
        'INSERT INTO foro_comentarios (foro_id, autor_id, comentario) VALUES (?, ?, ?)',
        [foroId, autorId, comentario]
      )
        .then(([result]) => resolve(result.insertId))
        .catch(err => reject(err));
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      pool.execute('DELETE FROM foro_comentarios WHERE id = ?', [id])
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  }
}

module.exports = { ForoModel, ForoComentarioModel };
