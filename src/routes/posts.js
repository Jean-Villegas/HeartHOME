const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// ==================== POSTS (Diagnósticos del Médico al Cliente) ====================

// Listar todos los posts (Médico y Administrador)
router.get('/', authenticateToken, authorizeRoles('Administrador', 'Medico'), async (req, res) => {
  try {
    const result = await postController.getAll(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener posts de un cliente específico (propio, Médico o Admin)
router.get('/cliente/:clienteId', authenticateToken, async (req, res) => {
  try {
    const isOwner = req.user.id === parseInt(req.params.clienteId);
    const isMedicoOrAdmin = ['Administrador', 'Medico'].includes(req.user.rol);
    
    if (!isOwner && !isMedicoOrAdmin) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver estos posts' });
    }
    
    const result = await postController.getByClienteId(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener post por ID (propietario del post, cliente asociado, Médico o Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await postController.getById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Crear post (Médico crea diagnóstico para cliente - NO elimina)
router.post('/', authenticateToken, authorizeRoles('Administrador', 'Medico'), async (req, res) => {
  try {
    const result = await postController.create(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar post (Médico que lo creó o Administrador)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await postController.update(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar post (SOLO Administrador - Médico NO puede eliminar)
router.delete('/:id', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await postController.remove(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
