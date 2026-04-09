const UsuarioModel = require('../models/UsuarioModel');
const ClienteModel = require('../models/ClienteModel');

// Listar todos los clientes (solo Administrador)
const getAll = async (req) => {
  try {
    const clientes = await ClienteModel.findAll();
    return { status: 200, data: clientes };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Obtener cliente por ID
const getById = async (req) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteModel.findById(id);
    if (!cliente) {
      return { status: 404, data: { mensaje: 'Cliente no encontrado' } };
    }
    return { status: 200, data: cliente };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Crear cliente (registro con información personal)
const create = async (req) => {
  try {
    const { username, password, email, nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero } = req.body;

    if (!username || !password || !email || !nombre || !apellido || !cedula) {
      return { status: 400, data: { mensaje: 'Todos los campos obligatorios son requeridos' } };
    }

    const existingUser = await UsuarioModel.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return { status: 400, data: { mensaje: 'El usuario o email ya existe' } };
    }

    const usuarioId = await UsuarioModel.create({
      username,
      password,
      email,
      rol: 'Cliente'
    });

    await ClienteModel.create({
      usuarioId,
      nombre,
      apellido,
      cedula,
      telefono,
      direccion,
      fecha_nacimiento,
      genero
    });

    return { status: 201, data: { mensaje: 'Cliente registrado correctamente', id: usuarioId } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Actualizar cliente
const update = async (req) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero } = req.body;

    const cliente = await ClienteModel.findById(id);
    if (!cliente) {
      return { status: 404, data: { mensaje: 'Cliente no encontrado' } };
    }

    const result = await ClienteModel.update(id, { nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero });
    if (!result) {
      return { status: 400, data: { mensaje: 'No hay campos para actualizar' } };
    }

    return { status: 200, data: { mensaje: 'Cliente actualizado correctamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

module.exports = { getAll, getById, create, update };
