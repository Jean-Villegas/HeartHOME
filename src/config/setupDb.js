require('dotenv').config();

const { initDatabase } = require('./initDb');
const { seed } = require('./seedDb');

async function setupDatabase() {
  console.log('🚀 Iniciando setup de base de datos...');
  await initDatabase();
  await seed();
  console.log('✅ Base de datos lista con datos de prueba.');
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error('❌ Error en setupDatabase:', error.message);
    process.exit(1);
  });
}

module.exports = { setupDatabase };
