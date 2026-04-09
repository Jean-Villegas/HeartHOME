const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Registro de usuario (crea usuario + info personal)
router.post('/register', async (req, res) => {
  try {
    const result = await authController.register(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const result = await authController.login(req);
    
    if (result.data.token) {
      res.cookie('token', result.data.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });
      // NO eliminar el token - el frontend lo necesita
    }
    
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  authController.logout(req, res);
});

// Usuario actual (protegido)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await authController.getMe(req);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
