const UsuarioModel = require('../models/UsuarioModel');
const MedicoModel = require('../models/MedicoModel');

// Listar todos los médicos
const getAll = async (req) => {
  try {
    const medicos = await MedicoModel.findAll();
    return { status: 200, data: medicos };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Obtener médico por ID
const getById = async (req) => {
  try {
    const { id } = req.params;
    const medico = await MedicoModel.findById(id);

    if (!medico) {
      return { status: 404, data: { mensaje: 'Médico no encontrado' } };
    }

    return { status: 200, data: medico };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Crear médico
const create = async (req) => {
  try {
    const { username, password, email, especialidad, cedula, telefono } = req.body;

    if (!username || !password || !email || !especialidad || !cedula) {
      return { status: 400, data: { mensaje: 'Todos los campos son obligatorios' } };
    }

    const existingUser = await UsuarioModel.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return { status: 400, data: { mensaje: 'El usuario o email ya existe' } };
    }

    const usuarioId = await UsuarioModel.create({
      username,
      password,
      email,
      rol: 'Medico'
    });

    await MedicoModel.create({
      usuarioId,
      especialidad,
      cedula,
      telefono
    });

    return { status: 201, data: { mensaje: 'Médico creado correctamente', id: usuarioId } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Actualizar médico
const update = async (req) => {
  try {
    const { id } = req.params;
    const { username, email, especialidad, cedula, telefono } = req.body;

    const medico = await MedicoModel.findById(id);
    if (!medico) {
      return { status: 404, data: { mensaje: 'Médico no encontrado' } };
    }

    if (username || email) {
      await UsuarioModel.update(id, { username, email });
    }

    const result = await MedicoModel.update(id, { especialidad, cedula, telefono });
    if (!result) {
      return { status: 400, data: { mensaje: 'No hay campos para actualizar' } };
    }

    return { status: 200, data: { mensaje: 'Médico actualizado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Eliminar médico
const remove = async (req) => {
  try {
    const { id } = req.params;

    const medico = await MedicoModel.findById(id);
    if (!medico) {
      return { status: 404, data: { mensaje: 'Médico no encontrado' } };
    }

    await MedicoModel.delete(id);
    await UsuarioModel.delete(id);

    return { status: 200, data: { mensaje: 'Médico eliminado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

module.exports = { getAll, getById, create, update, remove };
