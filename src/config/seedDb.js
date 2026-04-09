/**
 * Seed de datos del Sistema de Salud
 * Ejecutar UNA sola vez: node src/config/seedDb.js
 *
 * Crea:
 *  - 1 Administrador
 *  - 2 Médicos
 *  - 3 Pacientes (Clientes)
 *  - Perfiles de salud para cada paciente
 *  - 3 Posts en el foro
 *  - 4 Análisis médicos con y sin diagnóstico
 */

const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ── Datos de muestra ──────────────────────────────────────────────────────────

const USUARIOS = [
  // [username, email, password_plano, rol]
  ['admin',     'admin@salud.com',    'Admin123!',   'Administrador'],
  ['dr_garcia', 'garcia@salud.com',   'Medico123!',  'Medico'],
  ['dr_lopez',  'lopez@salud.com',    'Medico123!',  'Medico'],
  ['paciente1', 'maria@gmail.com',    'Paciente1!',  'Cliente'],
  ['paciente2', 'juan@gmail.com',     'Paciente2!',  'Cliente'],
  ['paciente3', 'luisa@gmail.com',    'Paciente3!',  'Cliente'],
];

const MEDICOS = [
  // usuario_index (0-based dentro de USUARIOS), especialidad, cedula, telefono
  [1, 'Cardiología',    '7654321', '04121234567'],
  [2, 'Endocrinología', '8765432', '04141234567'],
];

const CLIENTES = [
  // usuario_index, nombre, apellido, cedula, telefono, direccion, fecha_nac, genero
  [3, 'María',  'Pérez',   '12345678', '04161111111', 'Av. Principal 101', '1990-05-14', 'F'],
  [4, 'Juan',   'Rodríguez','23456789', '04142222222', 'Calle 5 Casa 3',   '1985-11-20', 'M'],
  [5, 'Luisa',  'Martínez', '34567890', '04263333333', 'Urb. Las Mercedes', '2000-03-08', 'F'],
];

const PERFILES_SALUD = [
  // cliente_usuario_index, peso_kg, altura_cm, tipo_sangre, color_piel, alergias, antecedentes
  [3, 62.5, 165, 'A+',  'moreno_claro', 'Penicilina',    'Diabetes tipo 2 familiar'],
  [4, 85.0, 175, 'O+',  'blanco',       null,            'Hipertensión arterial'],
  [5, 55.0, 160, 'AB+', 'moreno_medio', 'Polen, Ácaros', null],
];

const POSTS_FORO = [
  // autor_usuario_index, titulo, contenido
  [1, '¡Bienvenidos a HealthHub!',
    'Esta plataforma conecta médicos y pacientes. Comparte tus dudas, síntomas y consejos de salud con toda la comunidad.'],
  [3, '¿Cómo controlar los niveles de glucosa?',
    'Desde que me diagnosticaron pre-diabetes busco formas naturales de mantener la glucosa estable. ¿Algún consejo de la comunidad?'],
  [1, 'Tip del día: Hidratación',
    'Beber 2 litros de agua al día mejora la concentración, la digestión y el estado de ánimo. ¡Pequeños hábitos, grandes cambios!'],
];

const ANALISIS = [
  // cliente_index, medico_index_o_null, fecha_examen, tipo, glucosa, colesterol, trigliceridos, diag_paciente, diag_medico
  [3, 1, '2026-03-10', 'Sangre Completa', 112.5, 195.0, 140.0,
    'Me siento cansada y con visión borrosa después de comer.',
    'Glucosa en rango límite pre-diabético. Se recomienda dieta baja en carbohidratos, ejercicio aeróbico 30 min/día y control mensual.'],
  [4, null, '2026-03-25', 'Perfil Lipídico', 95.0, 242.0, 165.0,
    'Dolor leve en el pecho al hacer esfuerzo.',
    null],
  [5, 2, '2026-04-01', 'Hormonal + Lípidos', 88.0, 178.0, 130.0,
    'Siento fatiga constante y aumento de peso sin cambio de dieta.',
    'Valores dentro de rangos normales. Se solicita perfil tiroideo para descartar hipotiroidismo. Cita de seguimiento en 30 días.'],
  [3, null, '2026-04-05', 'Sangre Completa', 118.0, 201.0, 145.0,
    'Control mensual. Sigo con la dieta indicada.',
    null],
];

// ── Lógica de inserción ───────────────────────────────────────────────────────

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('✅ Conectado a la base de datos:', process.env.DB_NAME);

  // Mapa: usuario_index → id real en BD
  const userIds = {};

  // ── Usuarios ────────────────────────────────────────────────────────────────
  console.log('\n📝 Insertando usuarios...');
  for (let i = 0; i < USUARIOS.length; i++) {
    const [username, email, password, rol] = USUARIOS[i];
    const hash = await bcrypt.hash(password, 10);
    try {
      const [r] = await conn.execute(
        'INSERT INTO usuarios (username, email, password, rol) VALUES (?, ?, ?, ?)',
        [username, email, hash, rol]
      );
      userIds[i] = r.insertId;
      console.log(`   [${rol}] ${username} → id ${r.insertId}`);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        const [[row]] = await conn.execute('SELECT id FROM usuarios WHERE username = ?', [username]);
        userIds[i] = row.id;
        console.log(`   ⚠️  ${username} ya existe → id ${row.id}`);
      } else { throw e; }
    }
  }

  // ── Médicos ─────────────────────────────────────────────────────────────────
  console.log('\n🩺 Insertando médicos...');
  for (const [ui, especialidad, cedula, telefono] of MEDICOS) {
    try {
      await conn.execute(
        'INSERT INTO medicos (usuario_id, especialidad, cedula, telefono) VALUES (?, ?, ?, ?)',
        [userIds[ui], especialidad, cedula, telefono]
      );
      console.log(`   Dr. ${USUARIOS[ui][0]} (${especialidad})`);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log(`   ⚠️  Médico ${USUARIOS[ui][0]} ya existe`);
      else throw e;
    }
  }

  // ── Clientes ────────────────────────────────────────────────────────────────
  console.log('\n👤 Insertando clientes...');
  for (const [ui, nombre, apellido, cedula, telefono, direccion, fecha_nac, genero] of CLIENTES) {
    try {
      await conn.execute(
        `INSERT INTO clientes (usuario_id, nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, genero)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userIds[ui], nombre, apellido, cedula, telefono, direccion, fecha_nac, genero]
      );
      console.log(`   ${nombre} ${apellido}`);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log(`   ⚠️  Cliente ${nombre} ya existe`);
      else throw e;
    }
  }

  // ── Perfiles de salud ────────────────────────────────────────────────────────
  console.log('\n💊 Insertando perfiles de salud...');
  for (const [ui, peso, altura, sangre, piel, alergias, antecedentes] of PERFILES_SALUD) {
    try {
      await conn.execute(
        `INSERT INTO perfiles_salud (cliente_id, peso_kg, altura_cm, tipo_sangre, color_piel, alergias, antecedentes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userIds[ui], peso, altura, sangre, piel, alergias, antecedentes]
      );
      console.log(`   Perfil de ${USUARIOS[ui][0]}: ${peso}kg, ${altura}cm, ${sangre}`);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log(`   ⚠️  Perfil de ${USUARIOS[ui][0]} ya existe`);
      else throw e;
    }
  }

  // ── Posts del foro ────────────────────────────────────────────────────────────
  console.log('\n📰 Insertando posts del foro...');
  for (const [ui, titulo, contenido] of POSTS_FORO) {
    const [exists] = await conn.execute(
      'SELECT id FROM foros WHERE autor_id = ? AND titulo = ? LIMIT 1',
      [userIds[ui], titulo]
    );

    if (exists.length > 0) {
      console.log(`   ⚠️  Post "${titulo.substring(0, 30)}..." ya existe`);
      continue;
    }

    const [r] = await conn.execute(
      'INSERT INTO foros (autor_id, titulo, contenido) VALUES (?, ?, ?)',
      [userIds[ui], titulo, contenido]
    );
    console.log(`   Post #${r.insertId}: "${titulo.substring(0, 40)}..."`);
  }

  // ── Análisis médicos ──────────────────────────────────────────────────────────
  console.log('\n🔬 Insertando análisis médicos...');
  for (const [cui, mui, fecha, tipo, glucosa, colesterol, trigliceridos, diag_pac, diag_med] of ANALISIS) {
    const medicoId = mui !== null ? userIds[MEDICOS[mui][0]] : null;
    const fechaDiag = diag_med ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    const [exists] = await conn.execute(
      `SELECT id FROM analisis_medicos
       WHERE cliente_id = ? AND fecha_examen = ? AND tipo_examen = ?
       LIMIT 1`,
      [userIds[cui], fecha, tipo]
    );

    if (exists.length > 0) {
      console.log(`   ⚠️  Análisis ${tipo} (${fecha}) para ${USUARIOS[cui][0]} ya existe`);
      continue;
    }

    const [r] = await conn.execute(
      `INSERT INTO analisis_medicos
         (cliente_id, medico_id, fecha_examen, tipo_examen,
          resultados_glucosa, resultados_colesterol, resultados_trigliceridos,
          diagnostico_paciente, diagnostico_medico, fecha_diagnostico)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userIds[cui], medicoId, fecha, tipo,
       glucosa, colesterol, trigliceridos,
       diag_pac, diag_med, fechaDiag]
    );
    const estado = diag_med ? '✓ Diagnosticado' : '⏳ Pendiente';
    console.log(`   Análisis #${r.insertId}: ${USUARIOS[cui][0]} — ${tipo} ${estado}`);
  }

  await conn.end();

  console.log('\n🎉 Seed completado exitosamente.\n');
  console.log('Credenciales de acceso:');
  console.log('  Admin        → admin / Admin123!');
  console.log('  Médico 1     → dr_garcia / Medico123!');
  console.log('  Médico 2     → dr_lopez / Medico123!');
  console.log('  Paciente 1   → paciente1 / Paciente1!');
  console.log('  Paciente 2   → paciente2 / Paciente2!');
  console.log('  Paciente 3   → paciente3 / Paciente3!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Error en el seed:', err.message);
    process.exit(1);
  });
}

module.exports = { seed };
