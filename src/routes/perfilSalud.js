const express = require('express');
const router = express.Router();
const perfilSaludController = require('../controllers/perfilSaludController');
const { authenticateToken } = require('../middlewares/auth');

// Obtener el perfil de un cliente (Cliente ve el suyo, Médico/Admin ven cualquiera)
router.get('/:cliente_id', authenticateToken, async (req, res) => {
  try {
    const result = await perfilSaludController.getByClienteId(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar o crear perfil por ID de cliente (el propio usuario)
router.put('/:cliente_id', authenticateToken, async (req, res) => {
  try {
    const result = await perfilSaludController.upsertPerfil(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Ruta sin ID (legacy, mantener compatibilidad)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const result = await perfilSaludController.upsertPerfil(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;

