const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verificar token JWT
const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        mensaje: 'Acceso no autorizado',
        codigo: 'TOKEN_MISSING'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Error de token:', err.message);
        
        // Limpiar cookie si el token es inválido
        if (req.cookies.token) {
          res.clearCookie('token');
        }
        
        let mensaje = 'Token inválido';
        if (err.name === 'TokenExpiredError') {
          mensaje = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
        } else if (err.name === 'JsonWebTokenError') {
          mensaje = 'Token malformed. Por favor inicia sesión nuevamente.';
        }
        
        return res.status(403).json({ 
          mensaje,
          codigo: 'TOKEN_INVALID',
          expirado: err.name === 'TokenExpiredError'
        });
      }
      
      // Agregar timestamp de verificación
      req.user = {
        ...user,
        verifiedAt: new Date().toISOString()
      };
      next();
    });
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(500).json({ 
      mensaje: 'Error de autenticación',
      codigo: 'AUTH_ERROR'
    });
  }
};

// Autorización por rol
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
    }
    next();
  };
};

// Verificar propiedad del recurso o rol de administrador
const authorizeOwnerOrAdmin = (resourceOwnerField) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ mensaje: 'Acceso no autorizado' });
    }
    
    if (req.user.rol === 'Administrador') {
      return next();
    }
    
    if (req.user.rol === resourceOwnerField) {
      return next();
    }
    
    return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
  };
};

module.exports = { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin };
