const express = require('express');
const router = express.Router();
const foroController = require('../controllers/foroController');
const { authenticateToken } = require('../middlewares/auth');

// ==================== FOROS (Todos pueden participar) ====================
// Buscar foros (público)
router.get('/search', async (req, res) => {
  try {
    const result = await foroController.search(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Listar todos los foros (público)
router.get('/', async (req, res) => {
  try {
    const result = await foroController.getAll(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener foro por ID con comentarios (público)
router.get('/:id', async (req, res) => {
  try {
    const result = await foroController.getById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Crear foro (cualquier usuario autenticado - Cliente, Médico o Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const result = await foroController.create(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar foro (autor o Administrador)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await foroController.remove(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Agregar comentario a un foro (cualquier usuario autenticado)
router.post('/:id/comentarios', authenticateToken, async (req, res) => {
  try {
    const result = await foroController.addComentario(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener comentarios de un foro (público)
router.get('/:id/comentarios', async (req, res) => {
  try {
    const { ForoComentarioModel } = require('../models/ForoModel');
    const comentarios = await ForoComentarioModel.findByForoId(req.params.id);
    res.status(200).json(comentarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener comentarios' });
  }
});

// Eliminar comentario (autor o Administrador)
router.delete('/:id/comentarios/:comentarioId', authenticateToken, async (req, res) => {
  try {
    const result = await foroController.removeComentario(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
