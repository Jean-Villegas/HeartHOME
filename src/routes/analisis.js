const express = require('express');
const router = express.Router();
const analisisController = require('../controllers/analisisController');
const { authenticateToken } = require('../middlewares/auth');

// Obtener todos los análisis (Solo Médicos y Admins)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await analisisController.getAll(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener todos los análisis de un cliente
router.get('/cliente/:cliente_id', authenticateToken, async (req, res) => {
  try {
    const result = await analisisController.getAllByClienteId(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener un análisis específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await analisisController.getById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Crear un análisis nuevo (Solo Cliente)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const result = await analisisController.create(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar un análisis (Cliente dueño o Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await analisisController.remove(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar diagnóstico médico (Solo Médicos)
router.put('/:id/diagnosis', authenticateToken, async (req, res) => {
  try {
    const result = await analisisController.updateDiagnosis(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
