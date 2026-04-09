const AnalisisModel = require('../models/AnalisisModel');

const getAll = async (req) => {
  try {
    // Si es cliente, retornar solo sus propios análisis
    if (req.user.rol === 'Cliente') {
      const analisis = await AnalisisModel.findAllByClienteId(req.user.id);
      return { status: 200, data: analisis };
    }
    // Médicos y Administradores ven todos
    const analisis = await AnalisisModel.findAll();
    return { status: 200, data: analisis };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error al obtener los análisis' } };
  }
};


const getAllByClienteId = async (req) => {
  try {
    const { cliente_id } = req.params;

    // Verificación de permisos básica:
    if (req.user.rol === 'Cliente' && req.user.id !== parseInt(cliente_id)) {
      return { status: 403, data: { mensaje: 'No tienes permiso para ver estos análisis' } };
    }

    const analisis = await AnalisisModel.findAllByClienteId(cliente_id);
    return { status: 200, data: analisis };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error al obtener los análisis' } };
  }
};

const getById = async (req) => {
  try {
    const { id } = req.params;
    const analisis = await AnalisisModel.findById(id);

    if (!analisis) {
      return { status: 404, data: { mensaje: 'Análisis no encontrado' } };
    }

    if (req.user.rol === 'Cliente' && req.user.id !== analisis.cliente_id) {
      return { status: 403, data: { mensaje: 'No tienes permiso para ver este análisis' } };
    }

    return { status: 200, data: analisis };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error al obtener el análisis' } };
  }
};

const create = async (req) => {
  try {
    // Solo un cliente debería registrar sus propios análisis
    if (req.user.rol !== 'Cliente') {
      return { status: 403, data: { mensaje: 'Solo los clientes pueden registrar sus análisis' } };
    }

    const analysisData = {
      cliente_id: req.user.id,
      ...req.body
    };

    const resultId = await AnalisisModel.create(analysisData);
    return { status: 201, data: { mensaje: 'Análisis registrado correctamente', id: resultId } };
  } catch (error) {
    console.error('Error al crear análisis:', error.message);
    return { status: 500, data: { mensaje: 'Error al crear el análisis: ' + error.message } };
  }
};

const remove = async (req) => {
  try {
    const { id } = req.params;
    // Solo el cliente dueño o el Administrador puede borrar
    
    if (req.user.rol === 'Medico') {
         return { status: 403, data: { mensaje: 'No tienes permisos para eliminar análisis' } };
    }

    const result = await AnalisisModel.delete(id, req.user.id);
    if (!result) {
        return { status: 404, data: { mensaje: 'Análisis no encontrado o no tienes permiso' } };
    }
    
    return { status: 200, data: { mensaje: 'Análisis eliminado exitosamente' } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error al eliminar el análisis' } };
  }
};

const updateDiagnosis = async (req) => {
  try {
    const { id } = req.params;
    const { diagnostico_medico, medico_id } = req.body;

    // Solo médicos pueden diagnosticar
    if (req.user.rol !== 'Medico') {
      return { status: 403, data: { mensaje: 'Solo los médicos pueden realizar diagnósticos' } };
    }

    // Verificar que el médico esté diagnosticando con su propio ID
    if (medico_id !== req.user.id) {
      return { status: 403, data: { mensaje: 'No puedes diagnosticar en nombre de otro médico' } };
    }

    const result = await AnalisisModel.updateDiagnosis(id, { diagnostico_medico, medico_id });

    if (!result) {
      return { status: 404, data: { mensaje: 'Análisis no encontrado' } };
    }

    return { status: 200, data: { mensaje: 'Diagnóstico registrado correctamente' } };
  } catch (error) {
    console.error('Error en updateDiagnosis:', error.message);
    return { status: 500, data: { mensaje: 'Error al registrar diagnóstico: ' + error.message } };
  }
};

module.exports = { getAll, getAllByClienteId, getById, create, remove, updateDiagnosis };
