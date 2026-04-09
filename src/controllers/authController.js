const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const ClienteModel = require('../models/ClienteModel');
require('dotenv').config();

// Registro de usuario con información personal del cliente
const register = async (req) => {
  try {
    const { username, password, email, rol, nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero } = req.body;

    if (!username || !password || !email) {
      return { status: 400, data: { mensaje: 'Usuario, contraseña y email son obligatorios' } };
    }

    const existingUser = await UsuarioModel.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return { status: 400, data: { mensaje: 'El usuario o email ya existe' } };
    }

    // Crear usuario
    const usuarioId = await UsuarioModel.create({
      username,
      password,
      email,
      rol: rol || 'Cliente'
    });

    // Si es cliente, crear registro de información personal
    if (!rol || rol === 'Cliente') {
      await ClienteModel.create({
        usuarioId,
        nombre: nombre || username,
        apellido: apellido || '',
        cedula: cedula || '',
        telefono: telefono || '',
        direccion: direccion || '',
        fecha_nacimiento: fecha_nacimiento || null,
        genero: genero || null
      });
    }

    return { status: 201, data: { mensaje: 'Usuario registrado correctamente', id: usuarioId } };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Login de usuario
const login = async (req) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return { status: 400, data: { mensaje: 'Usuario y contraseña son obligatorios' } };
    }

    const user = await UsuarioModel.findByUsername(username);
    if (!user) {
      return { status: 401, data: { mensaje: 'Credenciales inválidas' } };
    }

    const isMatch = await UsuarioModel.verifyPassword(password, user.password);
    if (!isMatch) {
      return { status: 401, data: { mensaje: 'Credenciales inválidas' } };
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      status: 200,
      data: {
        mensaje: 'Login exitoso',
        token,
        usuario: { id: user.id, username: user.username, rol: user.rol }
      }
    };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

// Logout
const logout = (req, res) => {
  try {
    // Limpiar cookie de token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // También limpiar con cookie vacía expirada
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    });

    res.json({ 
      mensaje: 'Logout exitoso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ mensaje: 'Error al cerrar sesión' });
  }
};

// Obtener usuario actual
const getMe = async (req) => {
  try {
    const user = await UsuarioModel.findById(req.user.id);
    if (!user) {
      return { status: 404, data: { mensaje: 'Usuario no encontrado' } };
    }
    return { status: 200, data: user };
  } catch (error) {
    console.error(error);
    return { status: 500, data: { mensaje: 'Error en el servidor' } };
  }
};

module.exports = { register, login, logout, getMe };
