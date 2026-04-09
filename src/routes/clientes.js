const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// ==================== CLIENTES ====================
// Información personal - médicos ven/actualizan info de salud

// Listar todos los clientes (Médico y Administrador)
router.get('/', authenticateToken, authorizeRoles('Administrador', 'Medico'), async (req, res) => {
  try {
    const result = await clienteController.getAll(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener cliente por ID (propio, Médico o Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const isOwner = req.user.id === parseInt(req.params.id);
    const isMedicoOrAdmin = ['Administrador', 'Medico'].includes(req.user.rol);
    
    if (!isOwner && !isMedicoOrAdmin) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este cliente' });
    }
    
    const result = await clienteController.getById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar información personal del cliente (propio, Médico o Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const isOwner = req.user.id === parseInt(req.params.id);
    const isMedicoOrAdmin = ['Administrador', 'Medico'].includes(req.user.rol);
    
    if (!isOwner && !isMedicoOrAdmin) {
      return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este cliente' });
    }
    
    const result = await clienteController.update(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
