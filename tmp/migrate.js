const pool = require('../src/config/db');

async function migrate() {
  try {
    await pool.query('ALTER TABLE posts ADD COLUMN rutina_recomendada VARCHAR(200)');
    console.log('Column added');
  } catch(e) {
    console.log(e.message);
  }
  process.exit();
}
migrate();
