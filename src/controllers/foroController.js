const { ForoModel, ForoComentarioModel } = require('../models/ForoModel');

// Listar todos los foros
const getAll = async (req) => {
  try {
    const foros = await ForoModel.findAll();
    return { status: 200, data: foros };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Buscar foros
const search = async (req) => {
  try {
    const { q } = req.query;
    if (!q) {
      const foros = await ForoModel.findAll();
      return { status: 200, data: foros };
    }
    const foros = await ForoModel.search(q);
    return { status: 200, data: foros };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Obtener foro por ID con comentarios
const getById = async (req) => {
  try {
    const { id } = req.params;
    const foro = await ForoModel.findById(id);
    if (!foro) {
      return { status: 404, data: { mensaje: 'Foro no encontrado' } };
    }
    
    const comentarios = await ForoComentarioModel.findByForoId(id);
    return { status: 200, data: { ...foro, comentarios } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Crear foro (cualquier usuario autenticado)
const create = async (req) => {
  try {
    const { titulo, contenido } = req.body;
    const autorId = req.user.id;

    if (!titulo || !contenido) {
      return { status: 400, data: { mensaje: 'Título y contenido son obligatorios' } };
    }

    const id = await ForoModel.create({ autorId, titulo, contenido });
    return { status: 201, data: { mensaje: 'Foro creado correctamente', id } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Eliminar foro (autor o Administrador)
const remove = async (req) => {
  try {
    const { id } = req.params;
    const foro = await ForoModel.findById(id);
    
    if (!foro) {
      return { status: 404, data: { mensaje: 'Foro no encontrado' } };
    }

    if (foro.autor_id !== req.user.id && req.user.rol !== 'Administrador') {
      return { status: 403, data: { mensaje: 'No tienes permiso para eliminar este foro' } };
    }

    await ForoModel.delete(id);
    return { status: 200, data: { mensaje: 'Foro eliminado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Agregar comentario a un foro
const addComentario = async (req) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const autorId = req.user.id;

    if (!comentario) {
      return { status: 400, data: { mensaje: 'El comentario es obligatorio' } };
    }

    const foro = await ForoModel.findById(id);
    if (!foro) {
      return { status: 404, data: { mensaje: 'Foro no encontrado' } };
    }

    const comentarioId = await ForoComentarioModel.create({ foroId: id, autorId, comentario });
    return { status: 201, data: { mensaje: 'Comentario agregado correctamente', id: comentarioId } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Eliminar comentario (autor o Administrador)
const removeComentario = async (req) => {
  try {
    const { id, comentarioId } = req.params;
    
    const foro = await ForoModel.findById(id);
    if (!foro) {
      return { status: 404, data: { mensaje: 'Foro no encontrado' } };
    }

    const comentarios = await ForoComentarioModel.findByForoId(id);
    const comentario = comentarios.find(c => c.id === parseInt(comentarioId));
    
    if (!comentario) {
      return { status: 404, data: { mensaje: 'Comentario no encontrado' } };
    }

    if (comentario.autor_id !== req.user.id && req.user.rol !== 'Administrador') {
      return { status: 403, data: { mensaje: 'No tienes permiso para eliminar este comentario' } };
    }

    await ForoComentarioModel.delete(comentario.id);
    return { status: 200, data: { mensaje: 'Comentario eliminado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

module.exports = { getAll, getById, create, remove, addComentario, removeComentario, search };
