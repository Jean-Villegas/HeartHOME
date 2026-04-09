const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// ==================== MÉDICOS ====================
// CRUD de médicos - Solo Administrador

// Listar todos los médicos (solo Administrador)
router.get('/', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await medicoController.getAll(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener médico por ID (propio, Médico o Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const isOwner = req.user.id === parseInt(req.params.id);
    const isMedicoOrAdmin = ['Administrador', 'Medico'].includes(req.user.rol);
    
    if (!isOwner && !isMedicoOrAdmin) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este médico' });
    }
    
    const result = await medicoController.getById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Crear médico (solo Administrador)
router.post('/', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await medicoController.create(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar médico (propio o Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const isOwner = req.user.id === parseInt(req.params.id);
    
    if (!isOwner && req.user.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este médico' });
    }
    
    const result = await medicoController.update(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar médico (solo Administrador)
router.delete('/:id', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await medicoController.remove(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
