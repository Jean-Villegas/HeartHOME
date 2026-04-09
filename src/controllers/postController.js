const PostModel = require('../models/PostModel');
const ClienteModel = require('../models/ClienteModel');

// Listar todos los posts (Médico y Administrador)
const getAll = async (req) => {
  try {
    const posts = await PostModel.findAll();
    return { status: 200, data: posts };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Obtener post por ID
const getById = async (req) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);
    if (!post) {
      return { status: 404, data: { mensaje: 'Post no encontrado' } };
    }
    return { status: 200, data: post };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Obtener posts de un cliente específico
const getByClienteId = async (req) => {
  try {
    const { clienteId } = req.params;
    const posts = await PostModel.findByClienteId(clienteId);
    return { status: 200, data: posts };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Crear post (Médico crea diagnóstico para cliente)
const create = async (req) => {
  try {
    const { clienteId, titulo, contenido, tipo } = req.body;
    const medicoId = req.user.id;

    if (!clienteId || !titulo || !contenido) {
      return { status: 400, data: { mensaje: 'Cliente, título y contenido son obligatorios' } };
    }

    const cliente = await ClienteModel.findByUsuarioId(clienteId);
    if (!cliente) {
      return { status: 404, data: { mensaje: 'Cliente no encontrado' } };
    }

    const id = await PostModel.create({
      medicoId,
      clienteId,
      titulo,
      contenido,
      tipo
    });

    return { status: 201, data: { mensaje: 'Post creado correctamente', id } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Actualizar post (Médico que lo creó)
const update = async (req) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, tipo } = req.body;

    const post = await PostModel.findById(id);
    if (!post) {
      return { status: 404, data: { mensaje: 'Post no encontrado' } };
    }

    if (post.medico_id !== req.user.id && req.user.rol !== 'Administrador') {
      return { status: 403, data: { mensaje: 'No tienes permiso para actualizar este post' } };
    }

    const result = await PostModel.update(id, { titulo, contenido, tipo });
    if (!result) {
      return { status: 400, data: { mensaje: 'No hay campos para actualizar' } };
    }

    return { status: 200, data: { mensaje: 'Post actualizado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Eliminar post (Médico que lo creó o Administrador)
const remove = async (req) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id);
    if (!post) {
      return { status: 404, data: { mensaje: 'Post no encontrado' } };
    }

    if (post.medico_id !== req.user.id && req.user.rol !== 'Administrador') {
      return { status: 403, data: { mensaje: 'No tienes permiso para eliminar este post' } };
    }

    await PostModel.delete(id);
    return { status: 200, data: { mensaje: 'Post eliminado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

module.exports = { getAll, getById, getByClienteId, create, update, remove };
