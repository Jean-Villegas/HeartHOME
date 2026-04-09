const PerfilSaludModel = require('../models/PerfilSaludModel');

const getByClienteId = async (req) => {
  try {
    const { cliente_id } = req.params;
    
    // Clientes solo pueden ver su propio perfil
    // Médicos y administradores pueden ver cualquier perfil
    if (req.user.rol === 'Cliente' && req.user.id !== parseInt(cliente_id)) {
      return { status: 403, data: { mensaje: 'No tienes permiso para ver este perfil' } };
    }
    // Médicos y admins pasan directo

    const perfil = await PerfilSaludModel.findByClienteId(cliente_id);
    if (!perfil) {
      return { status: 200, data: null }; // Retornar null en lugar de 404 para evitar errores
    }

    return { status: 200, data: perfil };
  } catch (error) {
    console.error('Error en getByClienteId:', error);
    return { status: 500, data: { mensaje: 'Error al obtener el perfil de salud' } };
  }
};

const upsertPerfil = async (req) => {
  try {
    // Cualquier usuario autenticado puede actualizar su propio perfil de salud
    const cliente_id = req.params.cliente_id ? parseInt(req.params.cliente_id) : req.user.id;
    
    // Solo puede actualizar su propio perfil (a menos que sea Admin)
    if (cliente_id !== req.user.id && req.user.rol !== 'Administrador') {
      return { status: 403, data: { mensaje: 'No puedes actualizar el perfil de otro usuario' } };
    }

    await PerfilSaludModel.upsert(cliente_id, req.body);
    return { status: 200, data: { mensaje: 'Perfil de salud actualizado correctamente' } };
  } catch (error) {
    console.error('Error en upsertPerfil:', error);
    return { status: 500, data: { mensaje: 'Error al actualizar el perfil de salud: ' + error.message } };
  }
};

module.exports = { getByClienteId, upsertPerfil };
