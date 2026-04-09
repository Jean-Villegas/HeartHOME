const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// ==================== USUARIOS ====================
// Solo ADMINISTRADOR puede gestionar usuarios

// Listar todos los usuarios
router.get('/', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await usuarioController.getAll(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Buscar usuarios (para médicos y administradores)
router.get('/search', authenticateToken, authorizeRoles('Medico', 'Administrador'), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ mensaje: 'Término de búsqueda requerido' });
    }
    
    const result = await usuarioController.search(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar perfil completo (propio)
// Debe ir antes de '/:id' para evitar colisión con rutas dinámicas
router.put('/profile/me', authenticateToken, async (req, res) => {
  try {
    const result = await usuarioController.updateFullProfile(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener usuario por ID (propio o Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este usuario' });
    }
    const result = await usuarioController.getById(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Crear usuario (Admin crea cualquier rol)
router.post('/', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await usuarioController.create(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar usuario (propio o Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este usuario' });
    }
    const result = await usuarioController.update(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar usuario (SOLO Admin)
router.delete('/:id', authenticateToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const result = await usuarioController.remove(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
