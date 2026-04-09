const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const ClienteModel = require('../models/ClienteModel');
require('dotenv').config();

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEDULA_REGEX = /^\d{6,10}$/;
const ROLES_PERMITIDOS = new Set(['Cliente', 'Medico']);

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

// Registro de usuario con información personal del cliente
const register = async (req) => {
  try {
    const username = normalizeString(req.body?.username);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const email = normalizeString(req.body?.email).toLowerCase();
    const rol = normalizeString(req.body?.rol) || 'Cliente';
    const nombre = normalizeString(req.body?.nombre);
    const apellido = normalizeString(req.body?.apellido);
    const cedula = normalizeString(req.body?.cedula);
    const telefono = normalizeString(req.body?.telefono);
    const direccion = normalizeString(req.body?.direccion);
    const fecha_nacimiento = req.body?.fecha_nacimiento || null;
    const genero = req.body?.genero || null;

    if (!username || !password || !email) {
      return { status: 400, data: { mensaje: 'Usuario, contraseña y email son obligatorios' } };
    }

    if (!USERNAME_REGEX.test(username)) {
      return { status: 400, data: { mensaje: 'Usuario inválido: usa letras, números o guion bajo (3 a 30 caracteres)' } };
    }

    if (!EMAIL_REGEX.test(email)) {
      return { status: 400, data: { mensaje: 'Formato de email inválido' } };
    }

    if (password.trim().length < 6) {
      return { status: 400, data: { mensaje: 'La contraseña debe tener al menos 6 caracteres' } };
    }

    if (!ROLES_PERMITIDOS.has(rol)) {
      return { status: 400, data: { mensaje: 'Rol inválido para registro' } };
    }

    if (cedula && !CEDULA_REGEX.test(cedula)) {
      return { status: 400, data: { mensaje: 'La cédula debe contener solo números (6 a 10 dígitos)' } };
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
    const username = normalizeString(req.body?.username);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!username || !password.trim()) {
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
      sameSite: 'lax',
      path: '/'
    });

    // También limpiar con cookie vacía expirada
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
