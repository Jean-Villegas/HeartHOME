const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const medicoRoutes = require('./routes/medicos');
const clienteRoutes = require('./routes/clientes');
const postRoutes = require('./routes/posts');
const foroRoutes = require('./routes/foros');
const perfilSaludRoutes = require('./routes/perfilSalud');
const analisisRoutes = require('./routes/analisis');

const path = require('path');

const app = express();

// Middlewares
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
app.use(express.json());
app.use(cookieParser({
  httpOnly: true,
  secure: false, // false para desarrollo
  sameSite: 'lax'
}));
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/foros', foroRoutes);
app.use('/api/perfiles-salud', perfilSaludRoutes);
app.use('/api/analisis', analisisRoutes);

// Ruta de prueba API
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Salud funcionando' });
});

// Ruta raíz (servir frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
